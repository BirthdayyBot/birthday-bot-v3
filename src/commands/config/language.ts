import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess } from '#lib/utilities/default-embed';

@ApplyOptions<Command.Options>({
	name: 'config-language',
	description: 'Set the guild language',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('language')
					.setDescription('Set the guild language')
					.addStringOption((option) =>
						applyDescriptionLocalizedBuilder(
							option
								.setName('language')
								.setDescription('Language locale')
								.setRequired(true)
								.addChoices(
									createLocalizedChoice(LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS, {
										value: 'en-US'
									}),
									createLocalizedChoice(LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR, {
										value: 'fr'
									})
								),
							LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandLanguageDescription
			)
	}
})
export class ConfigLanguageSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const language = interaction.options.getString('language', true);
		const languageLabel = await resolveKey(
			interaction,
			language === 'fr'
				? LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR
				: LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS
		);
		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		await saveGuildConfig(guildId, { language }, interaction);

		return interaction.editReply(
			editReplySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandLanguageResponseUpdated, { language: languageLabel }),
				interaction.user
			)
		);
	}
}
