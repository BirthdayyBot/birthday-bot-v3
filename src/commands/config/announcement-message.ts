import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

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
			return interaction.reply({
				content: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseEmpty),
				ephemeral: true
			});
		}

		await saveGuildConfig(guildId, { announcementMessage: message }, interaction);

		return interaction.reply({
			content: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseUpdated),
			ephemeral: true
		});
	}
}
