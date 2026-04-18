import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { getTimeZone } from '#lib/utilities/tz';

@ApplyOptions<Command.Options>({
	name: 'config-timezone',
	description: 'Set the guild timezone',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('timezone')
					.setDescription('Set the guild timezone')
				.addStringOption((option) =>
					applyDescriptionLocalizedBuilder(
						option
							.setName('timezone')
							.setDescription('IANA timezone (e.g. Europe/Paris)')
							.setRequired(true)
							.setAutocomplete(true),
						'commands:config.subcommands.timezone.options.timezone.description'
					)
				),
				'commands:config.subcommands.timezone.description'
			)
	}
})
export class ConfigTimezoneSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const value = interaction.options.getString('timezone', true);
		const entry = getTimeZone(value);

		if (!entry) {
			return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.timezone.responses.invalid', { timezone: value }), ephemeral: true });
		}

		const current = await this.container.guild.findById(guildId);
		if (current?.timezone === entry.name) {
			return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.timezone.responses.alreadySet', { timezone: entry.full }), ephemeral: true });
		}

		await saveGuildConfig(guildId, { timezone: entry.name }, interaction);

		return interaction.reply({ content: await resolveKey(interaction, 'commands:config.subcommands.timezone.responses.updated', { timezone: entry.full }), ephemeral: true });
	}
}
