import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

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
							'commands:config.subcommands.birthdayPingRole.options.role.description'
						)
					),
				'commands:config.subcommands.birthdayPingRole.description'
			)
	}
})
export class ConfigBirthdayPingRoleSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const role = interaction.options.getRole('role', true);
		await saveGuildConfig(guildId, { birthdayPingRole: role.id }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.birthdayPingRole.responses.updated', { roleId: role.id }), ephemeral: true });
	}
}
