import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess } from '#lib/utilities/default-embed';

@ApplyOptions<Command.Options>({
	name: 'config-announcement-channel',
	description: 'Set the announcement channel',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('announcement-channel')
					.setDescription('Set the announcement channel')
					.addChannelOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('channel').setDescription('Channel used for birthday announcements').setRequired(true),
							LanguageKeys.Commands.Config.SubcommandAnnouncementChannelOptionChannelDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandAnnouncementChannelDescription
			)
	}
})
export class ConfigAnnouncementChannelSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const channel = interaction.options.getChannel('channel', true);

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		await saveGuildConfig(guildId, { announcementChannel: channel.id }, interaction);

		return interaction.editReply(
			editReplySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementChannelResponseUpdated, { channelId: channel.id }),
				interaction.user
			)
		);
	}
}
