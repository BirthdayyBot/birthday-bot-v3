import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
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
						'commands:config.subcommands.overviewMessage.options.message.description'
					)
				),
				'commands:config.subcommands.overviewMessage.description'
			)
	}
})
export class ConfigOverviewMessageSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const message = interaction.options.getString('message', true).trim();
		if (message.length === 0) {
			return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.overviewMessage.responses.empty'), ephemeral: true });
		}

		await saveGuildConfig(guildId, { overviewMessage: message }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.overviewMessage.responses.updated'), ephemeral: true });
	}
}
