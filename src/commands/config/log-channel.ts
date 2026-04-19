import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigLogChannelController } from '#lib/application/config-commands/ConfigLogChannelController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess } from '#lib/utilities/default-embed';

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
							LanguageKeys.Commands.Config.SubcommandLogChannelOptionChannelDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandLogChannelDescription
			)
	}
})
export class ConfigLogChannelSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const channel = interaction.options.getChannel('channel', true);

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		const defaultAnnouncementMessage = await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);
		const controller = new ConfigLogChannelController(this.container.guild, { defaultAnnouncementMessage });
		const applied = await controller.apply({ guildId, channelId: channel.id });

		return interaction.editReply(editReplySuccess(await resolveKey(interaction, applied.key, applied.args), interaction.user));
	}
}
