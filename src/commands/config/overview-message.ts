import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyWarning } from '#lib/utilities/default-embed';

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
							option.setName('message').setDescription('Overview message text').setRequired(true).setMaxLength(512),
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
			return interaction.reply(
				replyWarning(
					await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewMessageResponseEmpty),
					interaction.user
				)
			);
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		await saveGuildConfig(guildId, { overviewMessage: message }, interaction);
		const preview = message.length > 120 ? `${message.slice(0, 117)}...` : message;

		return interaction.editReply(
			editReplySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewMessageResponseUpdated, { message: preview }),
				interaction.user
			)
		);
	}
}
