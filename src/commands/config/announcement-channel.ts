import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

@ApplyOptions<Command.Options>({
	name: 'config-announcement-channel',
	description: 'Set the announcement channel',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('announcement-channel')
					.setDescription('Set the announcement channel')
				.addChannelOption((option) =>
					applyDescriptionLocalizedBuilder(
						option.setName('channel').setDescription('Channel used for birthday announcements').setRequired(true),
						'commands:config.subcommands.announcementChannel.options.channel.description'
					)
				),
				'commands:config.subcommands.announcementChannel.description'
			)
	}
})
export class ConfigAnnouncementChannelSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const channel = interaction.options.getChannel('channel', true);
		await saveGuildConfig(guildId, { announcementChannel: channel.id }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.announcementChannel.responses.updated', { channelId: channel.id }), ephemeral: true });
	}
}
