import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import { Emojis } from '#lib/util/constants';
import { ConfigLanguageController } from '#lib/application/config-commands/ConfigLanguageController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionUpdateOptions, type MessageComponentInteraction } from 'discord.js';
import type { PageContext } from '#lib/config-view/types';

const PANEL_URL = 'https://birthdayy.xyz';
const DOCS_URL = 'https://birthdayy.xyz/docs';
const SUPPORT_URL = 'https://birthdayy.xyz/discord';

@ApplyOptions<ConfigPage.Options>({
	position: 0,
	title: LanguageKeys.Commands.Config.SubcommandViewResponseTitle,
	selectLabel: LanguageKeys.Commands.Config.SubcommandViewMainSelectLabel,
	selectEmoji: Emojis.Compass
})
export class MainPage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController } = ctx;
		const { timezone, language } = (await viewController.execute({ guildId })).data;

		const [langEnUS, langFrFR, lTimezone, lLanguage, welcome, paramsTitle, linksTitle, btnPanelWeb, btnSupport, btnDocs] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelTimezone),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelLanguage),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewMainWelcome),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewMainParamsTitle),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewMainLinksTitle),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewMainBtnPanelWeb),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewMainBtnSupport),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewMainBtnDocs)
		]);

		const isFr = language === 'fr';
		const currentFlag = isFr ? '🇫🇷' : '🇺🇸';
		const currentName = isFr ? langFrFR : langEnUS;
		const toggleValue = isFr ? 'en-US' : 'fr';

		const description = [
			welcome,
			'',
			`${paramsTitle} :`,
			`• **${lLanguage}** : ${currentFlag} ${currentName}`,
			`• **${lTimezone}** : ${timezone}`,
			'',
			`${linksTitle} :`,
			`• [${btnPanelWeb}](${PANEL_URL})`,
			`• [${btnDocs}](${DOCS_URL})`,
			`• [${btnSupport}](${SUPPORT_URL})`
		].join('\n');

		return {
			embeds: [createDefaultEmbed(description, 'info')],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(`toggle-language:${toggleValue}`)
						.setLabel(`${currentFlag} ${currentName}`)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId('cfg-page:timezone-region').setLabel(timezone).setStyle(ButtonStyle.Secondary)
				),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setLabel(btnPanelWeb).setStyle(ButtonStyle.Link).setURL(PANEL_URL).setEmoji('🌐'),
					new ButtonBuilder().setLabel(btnSupport).setStyle(ButtonStyle.Link).setURL(SUPPORT_URL).setEmoji('💬'),
					new ButtonBuilder().setLabel(btnDocs).setStyle(ButtonStyle.Link).setURL(DOCS_URL).setEmoji('📖')
				)
			]
		};
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		if (!component.customId.startsWith('toggle-language:') || !component.isButton()) return null;

		const lang = component.customId.slice('toggle-language:'.length);
		const { guildId, guildRepository } = ctx;
		const opts = { defaultAnnouncementMessage: await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage) };
		const ctrl = new ConfigLanguageController(guildRepository, opts);
		await ctrl.apply({ guildId, language: lang, languageLabel: await resolveKey(component, ctrl.resolveLabelKey(lang)) });
		return 'main';
	}
}
