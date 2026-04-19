import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigTimezoneController } from '#lib/application/config-commands/ConfigTimezoneController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyInfo, replyWarning } from '#lib/utilities/default-embed';

@ApplyOptions<Command.Options>({
	name: 'config-timezone',
	description: 'Set the guild timezone',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('timezone')
					.setDescription('Set the guild timezone')
					.addStringOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('timezone').setDescription('IANA timezone (e.g. Europe/Paris)').setRequired(true).setAutocomplete(true),
							LanguageKeys.Commands.Config.SubcommandTimezoneOptionTimezoneDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandTimezoneDescription
			)
	}
})
export class ConfigTimezoneSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const value = interaction.options.getString('timezone', true);
		const defaultAnnouncementMessage = await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);
		const controller = new ConfigTimezoneController(this.container.guild, { defaultAnnouncementMessage });

		const preparation = await controller.prepare({ guildId, value });
		if (preparation.status === 'warning') {
			if (preparation.code === 'invalid') {
				const text = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandTimezoneResponseInvalid, preparation.args);
				return interaction.reply(replyWarning(text, interaction.user));
			}

			const text = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandTimezoneResponseAlreadySet, preparation.args);
			return interaction.reply(replyInfo(text, interaction.user));
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		const applied = await controller.apply({ guildId, timezone: preparation.data!.timezone, label: preparation.data!.label });

		return interaction.editReply(editReplySuccess(await resolveKey(interaction, applied.key, applied.args), interaction.user));
	}
}
