import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyWarning } from '#lib/utilities/default-embed';

@ApplyOptions<Command.Options>({
	name: 'config-announcement-message',
	description: 'Set the announcement message template',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('announcement-message')
					.setDescription('Set the announcement message template')
					.addStringOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('message').setDescription('Template text used in announcements').setRequired(true).setMaxLength(512),
							LanguageKeys.Commands.Config.SubcommandAnnouncementMessageOptionMessageDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandAnnouncementMessageDescription
			)
	}
})
export class ConfigAnnouncementMessageSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const message = interaction.options.getString('message', true).trim();
		if (message.length === 0) {
			return interaction.reply(
				replyWarning(await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseEmpty), interaction.user)
			);
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		await saveGuildConfig(guildId, { announcementMessage: message }, interaction);
		const preview = message.length > 120 ? `${message.slice(0, 117)}...` : message;

		return interaction.editReply(
			editReplySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseUpdated, { message: preview }),
				interaction.user
			)
		);
	}
}
