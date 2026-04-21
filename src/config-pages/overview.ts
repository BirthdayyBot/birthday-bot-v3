import { ConfigOverviewChannelController } from '#lib/application/config-commands/ConfigOverviewChannelController';
import { ConfigOverviewSortController } from '#lib/application/config-commands/ConfigOverviewSortController';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import type { PageContext } from '#lib/config-view/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { BirthdaySortMode } from '#lib/utilities/birthday-command';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	StringSelectMenuBuilder,
	type InteractionUpdateOptions,
	type MessageComponentInteraction
} from 'discord.js';

@ApplyOptions<ConfigPage.Options>({
	position: 4,
	title: LanguageKeys.Commands.Config.SubcommandViewEditOverviewTitle,
	selectEmoji: Emojis.News
})
export class OverviewPage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController } = ctx;
		const { guild, overviewSort } = (await viewController.execute({ guildId })).data;

		const [none, sortMonth, sortUpcoming, lOverviewChannel, lOverviewSort, plhOverviewChannel, plhSort, removeChannel] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Globals.None),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceMonth),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelOverviewChannel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelOverviewSort),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectOverviewChannelPlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectSortPlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditRemoveChannel)
		]);

		const sortLabel = overviewSort === 'upcoming' ? sortUpcoming : sortMonth;

		const actionBtns: ButtonBuilder[] = [];
		if (guild?.overviewChannel)
			actionBtns.push(new ButtonBuilder().setCustomId('rm-overview-channel').setLabel(removeChannel).setStyle(ButtonStyle.Danger));

		return {
			embeds: [
				createDefaultEmbed(
					[
						`> **${lOverviewChannel}:** ${guild?.overviewChannel ? `<#${guild.overviewChannel}>` : none}`,
						`> **${lOverviewSort}:** ${sortLabel}`
					].join('\n'),
					'info'
				)
			],
			components: [
				new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
					new ChannelSelectMenuBuilder()
						.setCustomId('edit-overview-channel')
						.setPlaceholder(plhOverviewChannel)
						.setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('edit-overview-sort')
						.setPlaceholder(plhSort)
						.addOptions([
							{ label: sortMonth, value: 'month' },
							{ label: sortUpcoming, value: 'upcoming' }
						])
				),
				...(actionBtns.length > 0 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)] : [])
			]
		};
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		const { guildId, guildRepository } = ctx;
		const opts = { defaultAnnouncementMessage: await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage) };

		switch (component.customId) {
			case 'edit-overview-channel': {
				if (!component.isChannelSelectMenu()) return null;
				await new ConfigOverviewChannelController(guildRepository, opts).apply({ guildId, channelId: component.values[0] });
				return 'overview';
			}
			case 'edit-overview-sort': {
				if (!component.isStringSelectMenu()) return null;
				const sort = component.values[0] as BirthdaySortMode;
				const ctrl = new ConfigOverviewSortController(guildRepository, opts);
				await ctrl.apply({ guildId, sort, modeLabel: await resolveKey(component, ctrl.resolveLabelKey(sort)) });
				return 'overview';
			}
			case 'rm-overview-channel':
				await saveGuildConfig(guildRepository, guildId, { overviewChannel: null }, opts.defaultAnnouncementMessage);
				return 'overview';
			default:
				return null;
		}
	}
}
