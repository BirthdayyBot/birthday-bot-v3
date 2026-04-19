import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigBirthdayPingRoleController } from '#lib/application/config-commands/ConfigBirthdayPingRoleController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess } from '#lib/utilities/default-embed';

@ApplyOptions<Command.Options>({
	name: 'config-birthday-ping-role',
	description: 'Set the birthday ping role',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('birthday-ping-role')
					.setDescription('Set the birthday ping role')
					.addRoleOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('role').setDescription('Role pinged in announcements').setRequired(true),
							LanguageKeys.Commands.Config.SubcommandBirthdayPingRoleOptionRoleDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandBirthdayPingRoleDescription
			)
	}
})
export class ConfigBirthdayPingRoleSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const role = interaction.options.getRole('role', true);

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		const defaultAnnouncementMessage = await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);
		const controller = new ConfigBirthdayPingRoleController(this.container.guild, { defaultAnnouncementMessage });
		const applied = await controller.apply({ guildId, roleId: role.id });

		return interaction.editReply(editReplySuccess(await resolveKey(interaction, applied.key, applied.args), interaction.user));
	}
}
