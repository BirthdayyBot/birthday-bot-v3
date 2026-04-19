import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigLanguageController } from '#lib/application/config-commands/ConfigLanguageController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
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
		const defaultAnnouncementMessage = await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);
		const controller = new ConfigLanguageController(this.container.guild, { defaultAnnouncementMessage });
		const languageLabel = await resolveKey(interaction, controller.resolveLabelKey(language));

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		const applied = await controller.apply({ guildId, language, languageLabel });

		return interaction.editReply(editReplySuccess(await resolveKey(interaction, applied.key, applied.args), interaction.user));
	}
}
