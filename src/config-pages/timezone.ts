import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import { TIMEZONE_REGIONS } from '#lib/config-view/timezones';
import type { PageContext } from '#lib/config-view/types';
import { ConfigTimezoneController } from '#lib/application/config-commands/ConfigTimezoneController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import { getTimeZonesByPrefix } from '#lib/utilities/tz';
import { ActionRowBuilder, StringSelectMenuBuilder, type InteractionUpdateOptions, type MessageComponentInteraction } from 'discord.js';

@ApplyOptions<ConfigPage.Options>({
	position: 1.5,
	title: LanguageKeys.Commands.Config.SubcommandViewEditGeneralTitle,
	parentPage: 'timezone-region'
})
export class TimezonePage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController, params } = ctx;
		const { guild, timezone, language } = (await viewController.execute({ guildId })).data;

		const [yes, no, langEnUS, langFrFR, lTimezone, lLanguage, lActive, lPremium, plhTimezone] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Globals.Yes),
			resolveKey(ctx.interaction, LanguageKeys.Globals.No),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelTimezone),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelLanguage),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelActive),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelPremium),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectTimezonePlaceholder)
		]);

		const langLabel = language === 'fr' ? langFrFR : langEnUS;
		const regionKey = params.region ?? 'europe';
		const region = TIMEZONE_REGIONS[regionKey];

		return {
			embeds: [
				createDefaultEmbed(
					[
						`> **${lTimezone}:** ${timezone}`,
						`> **${lLanguage}:** ${langLabel}`,
						`> **${lActive}:** ${guild?.disabled ? no : yes}`,
						`> **${lPremium}:** ${guild?.premium ? yes : no}`
					].join('\n'),
					'info'
				)
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('tz-specific')
						.setPlaceholder(plhTimezone)
						.addOptions(
							getTimeZonesByPrefix(region.prefixes)
								.slice(0, 25)
								.map((zone) => ({ label: zone.full, value: zone.name }))
						)
				)
			]
		};
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		if (component.customId !== 'tz-specific' || !component.isStringSelectMenu()) return null;

		const { guildId, guildRepository } = ctx;
		const opts = { defaultAnnouncementMessage: await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage) };
		const ctrl = new ConfigTimezoneController(guildRepository, opts);
		const prep = await ctrl.prepare({ guildId, value: component.values[0] });
		if (prep.status !== 'warning') {
			await ctrl.apply({ guildId, timezone: prep.data!.timezone, label: prep.data!.label });
		}
		return 'main';
	}
}
