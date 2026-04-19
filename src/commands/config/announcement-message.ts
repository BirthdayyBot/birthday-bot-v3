import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigAnnouncementMessageController } from '#lib/application/config-commands/ConfigAnnouncementMessageController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
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

		const value = interaction.options.getString('message', true);
		const defaultAnnouncementMessage = await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);
		const controller = new ConfigAnnouncementMessageController(this.container.guild, { defaultAnnouncementMessage });

		const preparation = controller.prepare({ value });
		if (preparation.status === 'warning') {
			const text = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseEmpty);
			return interaction.reply(replyWarning(text, interaction.user));
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		const applied = await controller.apply({ guildId, message: preparation.data!.message, preview: preparation.data!.preview });

		return interaction.editReply(editReplySuccess(await resolveKey(interaction, applied.key, applied.args), interaction.user));
	}
}
