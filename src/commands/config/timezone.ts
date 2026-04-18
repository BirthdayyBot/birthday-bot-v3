import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyInfo, replyWarning } from '#lib/utilities/default-embed';
import { getTimeZone } from '#lib/utilities/tz';

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
		const entry = getTimeZone(value);

		if (!entry) {
			return interaction.reply(
				replyWarning(
					await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandTimezoneResponseInvalid, { timezone: value }),
					interaction.user
				)
			);
		}

		const current = await this.container.guild.findById(guildId);
		if (current?.timezone === entry.name) {
			return interaction.reply(
				replyInfo(
					await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandTimezoneResponseAlreadySet, { timezone: entry.full }),
					interaction.user
				)
			);
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		await saveGuildConfig(guildId, { timezone: entry.name }, interaction);

		return interaction.editReply(
			editReplySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandTimezoneResponseUpdated, { timezone: entry.full }),
				interaction.user
			)
		);
	}
}
