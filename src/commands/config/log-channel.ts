import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

@ApplyOptions<Command.Options>({
	name: 'config-log-channel',
	description: 'Set the log channel',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('log-channel')
					.setDescription('Set the log channel')
					.addChannelOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('channel').setDescription('Channel used for logs').setRequired(true),
							'commands:config.subcommands.logChannel.options.channel.description'
						)
					),
				'commands:config.subcommands.logChannel.description'
			)
	}
})
export class ConfigLogChannelSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const channel = interaction.options.getChannel('channel', true);
		await saveGuildConfig(guildId, { logChannel: channel.id }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.logChannel.responses.updated', { channelId: channel.id }), ephemeral: true });
	}
}
