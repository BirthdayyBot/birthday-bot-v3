import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

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
							.addChoices(createLocalizedChoice('commands:config.subcommands.language.options.language.choices.enUS', { value: 'en-US' })),
						'commands:config.subcommands.language.options.language.description'
					)
				),
				'commands:config.subcommands.language.description'
			)
	}
})
export class ConfigLanguageSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const language = interaction.options.getString('language', true);
		await saveGuildConfig(guildId, { language }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.language.responses.updated', { language }), ephemeral: true });
	}
}
