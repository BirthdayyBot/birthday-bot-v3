import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

@ApplyOptions<Command.Options>({
	name: 'config-overview-message',
	description: 'Set the overview message',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('overview-message')
					.setDescription('Set the overview message')
				.addStringOption((option) =>
					applyDescriptionLocalizedBuilder(
						option.setName('message').setDescription('Overview message text').setRequired(true).setMaxLength(20),
						LanguageKeys.Commands.Config.SubcommandOverviewMessageOptionMessageDescription
					)
				),
				LanguageKeys.Commands.Config.SubcommandOverviewMessageDescription
			)
	}
})
export class ConfigOverviewMessageSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const message = interaction.options.getString('message', true).trim();
		if (message.length === 0) {
			return interaction.reply({ content: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewMessageResponseEmpty), ephemeral: true });
		}

		await saveGuildConfig(guildId, { overviewMessage: message }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewMessageResponseUpdated), ephemeral: true });
	}
}
