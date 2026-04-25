import { container } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import {
	ActionRowBuilder,
	ButtonBuilder,
	StringSelectMenuBuilder,
	type MessageComponentInteraction,
	type InteractionUpdateOptions
} from 'discord.js';
import type { PageContext } from './types';

const NAV_SELECT_ID = 'cfg-page-nav';
const NAV_BUTTON_PREFIX = 'cfg-page:';

export class ConfigPageRunner {
	public async renderPage(pageName: string, ctx: PageContext): Promise<InteractionUpdateOptions> {
		const page = container.stores.get('config-pages').get(pageName);
		if (!page) throw new Error(`Config page "${pageName}" not found`);

		const updatedCtx: PageContext = { ...ctx, currentPage: pageName };
		const content = await page.buildContent(updatedCtx);

		const titleStr = await this.resolveEmbedTitle(pageName, ctx);
		const botAvatarURL = container.client.user?.displayAvatarURL() ?? undefined;
		if (Array.isArray(content.embeds) && content.embeds.length > 0) {
			const embed = content.embeds[0] as ReturnType<typeof createDefaultEmbed>;
			if ('setAuthor' in embed && typeof embed.setAuthor === 'function') {
				embed.setAuthor({ name: titleStr, iconURL: botAvatarURL });
			}
			if ('setFooter' in embed && typeof embed.setFooter === 'function') {
				embed.setFooter({ text: ctx.interaction.guild?.name ?? '' });
			}
		}

		const extraRows: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];

		const navSelect = await this.buildNavSelect(ctx, pageName);
		if (navSelect) extraRows.push(navSelect as ActionRowBuilder<StringSelectMenuBuilder>);

		content.components = [...extraRows, ...(content.components ?? [])];
		return content;
	}

	public async routeInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<PageContext> {
		if (component.customId.startsWith(NAV_BUTTON_PREFIX)) {
			const targetPage = component.customId.slice(NAV_BUTTON_PREFIX.length);
			return this.navigateTo(component, ctx, targetPage, {});
		}

		if (component.customId === NAV_SELECT_ID && component.isStringSelectMenu()) {
			const targetPage = component.values[0];
			return this.navigateTo(component, ctx, targetPage, {});
		}

		const page = container.stores.get('config-pages').get(ctx.currentPage);
		if (!page) return ctx;

		const result = await page.handleInteraction(component, ctx);
		if (result === null) return ctx;

		const { page: targetPage, params } = typeof result === 'string' ? { page: result, params: {} } : result;
		return this.navigateTo(component, ctx, targetPage, params);
	}

	private async navigateTo(
		component: MessageComponentInteraction,
		ctx: PageContext,
		targetPage: string,
		extraParams: Record<string, string>
	): Promise<PageContext> {
		const nav = this.buildNavigation(ctx.navigation, targetPage);
		const updatedCtx: PageContext = { ...ctx, currentPage: targetPage, navigation: nav, params: { ...ctx.params, ...extraParams } };
		await component.update(await this.renderPage(targetPage, updatedCtx));
		return updatedCtx;
	}

	private buildNavigation(current: string[], next: string): string[] {
		const idx = current.indexOf(next);
		if (idx !== -1) return current.slice(0, idx + 1);
		return [...current, next];
	}

	private async buildNavSelect(ctx: PageContext, pageName: string): Promise<ActionRowBuilder<StringSelectMenuBuilder> | null> {
		const store = container.stores.get('config-pages');

		const allPages = store.getMainPages();
		if (allPages.length === 0) return null;

		const mainPage = store.get('main');
		const placeholder = mainPage ? await resolveKey(ctx.interaction, mainPage.selectLabel) : '—';

		const options = await Promise.all(
			allPages.map(async (page) => ({
				label: await resolveKey(ctx.interaction, page.selectLabel),
				value: page.name,
				default: page.name === pageName,
				...(page.selectEmoji ? { emoji: this.parseEmoji(page.selectEmoji) } : {})
			}))
		);

		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder().setCustomId(NAV_SELECT_ID).setPlaceholder(placeholder).addOptions(options)
		);
	}

	private async resolveEmbedTitle(pageName: string, ctx: PageContext): Promise<string> {
		const store = container.stores.get('config-pages');
		const baseTitle = await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewResponseTitle);

		if (pageName === 'main') return baseTitle;

		const chain: string[] = [];

		let current = store.get(pageName);
		while (current) {
			chain.unshift(await resolveKey(ctx.interaction, current.title));
			current = current.parentPage ? store.get(current.parentPage) : undefined;
		}

		return [baseTitle, ...chain].join(' | ');
	}

	/** Parses `<:name:id>` or `<a:name:id>` into `{ id, name, animated }`. Falls back to `{ name: emoji }` for unicode. */
	private parseEmoji(emoji: string): { id?: string; name?: string; animated?: boolean } {
		const match = /^<(a?):(\w+):(\d+)>$/.exec(emoji);
		if (match) return { animated: match[1] === 'a', name: match[2], id: match[3] };
		return { name: emoji };
	}
}
