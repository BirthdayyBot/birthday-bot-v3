import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import { TIMEZONE_REGIONS } from '#lib/config-view/timezones';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import { ActionRowBuilder, StringSelectMenuBuilder, type InteractionUpdateOptions, type MessageComponentInteraction } from 'discord.js';
import type { PageContext } from '#lib/config-view/types';

@ApplyOptions<ConfigPage.Options>({
	position: 1,
	title: LanguageKeys.Commands.Config.SubcommandViewLabelTimezone,
	parentPage: 'main'
})
export class TimezoneRegionPage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController } = ctx;
		const { timezone } = (await viewController.execute({ guildId })).data;

		const plhTimezoneRegion = await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectTimezoneRegionPlaceholder);

		return {
			embeds: [createDefaultEmbed(`**${timezone}**`, 'info')],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('tz-region')
						.setPlaceholder(plhTimezoneRegion)
						.addOptions(Object.entries(TIMEZONE_REGIONS).map(([key, r]) => ({ label: r.label, value: key, emoji: r.emoji })))
				)
			]
		};
	}

	public override handleInteraction(component: MessageComponentInteraction, _ctx: PageContext): RouteResult {
		if (component.customId !== 'tz-region' || !component.isStringSelectMenu()) return null;
		return { page: 'timezone', params: { region: component.values[0] } };
	}
}
