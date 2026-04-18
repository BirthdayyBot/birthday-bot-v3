import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';

@ApplyOptions<Command.Options>({
	name: 'config-birthday-role',
	description: 'Set the birthday role',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('birthday-role')
					.setDescription('Set the birthday role')
					.addRoleOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('role').setDescription('Role assigned on birthdays').setRequired(true),
							'commands:config.subcommands.birthdayRole.options.role.description'
						)
					),
				'commands:config.subcommands.birthdayRole.description'
			)
	}
})
export class ConfigBirthdayRoleSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const role = interaction.options.getRole('role', true);
		await saveGuildConfig(guildId, { birthdayRole: role.id }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.birthdayRole.responses.updated', { roleId: role.id }), ephemeral: true });
	}
}
