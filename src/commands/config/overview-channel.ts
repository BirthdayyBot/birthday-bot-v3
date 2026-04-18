import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

@ApplyOptions<Command.Options>({
	name: 'config-overview-channel',
	description: 'Set the overview channel',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('overview-channel')
					.setDescription('Set the overview channel')
					.addChannelOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('channel').setDescription('Channel used for overview posts').setRequired(true),
							LanguageKeys.Commands.Config.SubcommandOverviewChannelOptionChannelDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandOverviewChannelDescription
			)
	}
})
export class ConfigOverviewChannelSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const channel = interaction.options.getChannel('channel', true);
		await saveGuildConfig(guildId, { overviewChannel: channel.id }, interaction);

		return interaction.reply({
			content: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewChannelResponseUpdated, { channelId: channel.id }),
			ephemeral: true
		});
	}
}
