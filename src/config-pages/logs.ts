import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import { Emojis } from '#utils/constants';
import type { PageContext } from '#lib/config-view/types';
import { ConfigLogChannelController } from '#lib/application/config-commands/ConfigLogChannelController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	type InteractionUpdateOptions,
	type MessageComponentInteraction
} from 'discord.js';

@ApplyOptions<ConfigPage.Options>({
	position: 5,
	title: LanguageKeys.Commands.Config.SubcommandViewEditLogsTitle,
	selectEmoji: Emojis.Book
})
export class LogsPage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController } = ctx;
		const { guild } = (await viewController.execute({ guildId })).data;

		const [none, lLogChannel, plhLogChannel, removeChannel] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Globals.None),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelLogChannel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectLogChannelPlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditRemoveChannel)
		]);

		const actionBtns: ButtonBuilder[] = [];
		if (guild?.logChannel)
			actionBtns.push(new ButtonBuilder().setCustomId('rm-log-channel').setLabel(removeChannel).setStyle(ButtonStyle.Danger));

		return {
			embeds: [createDefaultEmbed(`> **${lLogChannel}:** ${guild?.logChannel ? `<#${guild.logChannel}>` : none}`, 'info')],
			components: [
				new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
					new ChannelSelectMenuBuilder()
						.setCustomId('edit-log-channel')
						.setPlaceholder(plhLogChannel)
						.setChannelTypes([ChannelType.GuildText])
				),
				...(actionBtns.length > 0 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)] : [])
			]
		};
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		const { guildId, guildRepository } = ctx;
		const opts = { defaultAnnouncementMessage: await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage) };

		switch (component.customId) {
			case 'edit-log-channel': {
				if (!component.isChannelSelectMenu()) return null;
				await new ConfigLogChannelController(guildRepository, opts).apply({ guildId, channelId: component.values[0] });
				return 'logs';
			}
			case 'rm-log-channel':
				await saveGuildConfig(guildRepository, guildId, { logChannel: null }, opts.defaultAnnouncementMessage);
				return 'logs';
			default:
				return null;
		}
	}
}
