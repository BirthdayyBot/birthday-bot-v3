import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import type { PageContext } from '#lib/config-view/types';
import type { PremiumGrant } from '#lib/domain/premium/PremiumGrant';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import { CdnUrls, Emojis, resolveEmoji } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionUpdateOptions, type MessageComponentInteraction } from 'discord.js';

@ApplyOptions<ConfigPage.Options>({
	position: 6,
	title: LanguageKeys.Commands.Config.SubcommandViewEditPremiumTitle,
	selectEmoji: Emojis.Crown
})
export class PremiumPage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, userId } = ctx;
		const [user, grants] = await Promise.all([container.user.findById(userId), container.premium.findByUserId(userId)]);
		const guildNames = this.resolveGrantGuildNames(grants, ctx);
		return this.buildPremiumView(ctx, user?.patreonMaxSlots ?? 0, grants, guildId, guildNames);
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		const { guildId, userId } = ctx;

		if (component.customId === 'pm-activate' && component.isButton()) {
			const [user, grants] = await Promise.all([container.user.findById(userId), container.premium.findByUserId(userId)]);
			const maxSlots = user?.patreonMaxSlots ?? 0;
			const usedSlots = grants.filter((g) => g.guildId !== null).length;
			if (maxSlots > 0 && usedSlots < maxSlots && !grants.some((g) => g.guildId === guildId)) {
				await container.premium.add({ userId, guildId });
				await container.guild.update(guildId, { premium: true });
			}
			return 'premium';
		}

		if (component.customId === 'pm-deactivate' && component.isButton()) {
			const grants = await container.premium.findByUserId(userId);
			if (grants.some((g) => g.guildId === guildId)) {
				await container.premium.removeByUserAndGuild(userId, guildId);
				const remainingGrant = await container.premium.findByGuildId(guildId);
				if (!remainingGrant) await container.guild.update(guildId, { premium: false });
			}
			return 'premium';
		}

		return null;
	}

	private async buildPremiumView(
		ctx: PageContext,
		patreonMaxSlots: number,
		grants: PremiumGrant[],
		currentGuildId: string,
		guildNames: Map<string, string>
	): Promise<InteractionUpdateOptions> {
		const isActive = grants.some((g) => g.guildId === currentGuildId);
		const usedSlots = grants.filter((g) => g.guildId !== null).length;
		const hasSlots = usedSlots < patreonMaxSlots;
		const isPatron = patreonMaxSlots > 0;

		const [
			yes,
			no,
			pmNotPatron,
			pmNotPatronDescription,
			pmPatreonButton,
			pmActivateHere,
			pmDeactivateHere,
			pmSlotsLabel,
			lPremium,
			pmServersLabel,
			editPremiumTitle
		] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Globals.Yes),
			resolveKey(ctx.interaction, LanguageKeys.Globals.No),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumNotPatron),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumNotPatronDescription),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumPatreonButton),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumActivateHere),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumDeactivateHere),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumSlotsLabel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelPremium),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumServersLabel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditPremiumTitle)
		]);

		if (!isPatron) {
			const embed = createDefaultEmbed(pmNotPatron, 'info')
				.setDescription(`${resolveEmoji(Emojis.Crown)} **${pmNotPatron}**\n\n${pmNotPatronDescription}`)
				.setThumbnail(CdnUrls.CupCake);
			return {
				embeds: [embed],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder().setLabel(pmPatreonButton).setStyle(ButtonStyle.Link).setURL('https://www.patreon.com/birthdayy')
					)
				]
			};
		}

		const slotBar = Array.from({ length: patreonMaxSlots }, (_, i) =>
			i < usedSlots ? resolveEmoji(Emojis.Online) : resolveEmoji(Emojis.Offline)
		).join(' ');

		const currentGuildName = guildNames.get(currentGuildId) ?? currentGuildId;
		const currentGuildLine = isActive
			? `${resolveEmoji(Emojis.Success)} **${currentGuildName}** ← current`
			: `${resolveEmoji(Emojis.Offline)} ~~${currentGuildName}~~ ← current`;
		const otherLines = grants
			.filter((g) => g.guildId !== null && g.guildId !== currentGuildId)
			.map((g) => `${resolveEmoji(Emojis.Crown)} **${guildNames.get(g.guildId!) ?? g.guildId}**`);

		const currentGuildStatus = isActive
			? `${resolveEmoji(Emojis.Success)} ${resolveEmoji(Emojis.Crown)} **${yes}**`
			: `${resolveEmoji(Emojis.Offline)} **${no}**`;

		const embed = createDefaultEmbed(`${resolveEmoji(Emojis.Crown)} **${editPremiumTitle}**`, 'info').addFields(
			{ name: `${resolveEmoji(Emojis.People)} ${pmSlotsLabel}`, value: `${slotBar}  **${usedSlots}/${patreonMaxSlots}**`, inline: true },
			{ name: `${resolveEmoji(Emojis.Crown)} ${lPremium}`, value: currentGuildStatus, inline: true },
			{ name: `${resolveEmoji(Emojis.News)} ${pmServersLabel}`, value: [currentGuildLine, ...otherLines].join('\n') }
		);

		return {
			embeds: [embed],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('pm-activate')
						.setLabel(pmActivateHere)
						.setStyle(ButtonStyle.Success)
						.setDisabled(isActive || !hasSlots),
					new ButtonBuilder().setCustomId('pm-deactivate').setLabel(pmDeactivateHere).setStyle(ButtonStyle.Danger).setDisabled(!isActive)
				)
			]
		};
	}

	private resolveGrantGuildNames(grants: PremiumGrant[], ctx: PageContext): Map<string, string> {
		const map = new Map<string, string>();
		const { client } = ctx.interaction;
		map.set(ctx.guildId, ctx.interaction.guild?.name ?? ctx.guildId);
		for (const grant of grants) {
			if (!grant.guildId) continue;
			map.set(grant.guildId, client.guilds.cache.get(grant.guildId)?.name ?? grant.guildId);
		}
		return map;
	}
}
