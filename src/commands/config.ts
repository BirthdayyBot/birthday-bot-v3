import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { getTimeZone, searchTimeZone } from '#lib/utilities/tz';

@ApplyOptions<Subcommand.Options>({
	description: 'Configure guild settings',
	subcommands: [{ name: 'timezone', chatInputRun: 'chatInputTimezone' }]
})
export class ConfigCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions('0')
				.addSubcommand((sub) =>
					sub
						.setName('timezone')
						.setDescription('Set the guild timezone')
						.addStringOption((option) =>
							option
								.setName('timezone')
								.setDescription('IANA timezone (e.g. Europe/Paris)')
								.setRequired(true)
								.setAutocomplete(true)
						)
				),
		);
	}

	public async chatInputTimezone(interaction: Subcommand.ChatInputCommandInteraction) {
		const value = interaction.options.getString('timezone', true);
		const entry = getTimeZone(value);

		if (!entry) {
			return interaction.reply({ content: `Unknown timezone \`${value}\`. Use the autocomplete to pick a valid one.`, ephemeral: true });
		}

		await this.container.guild.update(interaction.guildId!, { timezone: entry.name });

		return interaction.reply({ content: `Guild timezone set to **${entry.full}**.`, ephemeral: true });
	}

	public override async autocompleteRun(interaction: Subcommand.AutocompleteInteraction) {
		const query = interaction.options.getFocused();
		const results = searchTimeZone(query);

		return interaction.respond(
			results.map((result) => ({
				name: `${result.score === 1 ? '⭐' : '📄'} ${result.value.full}`,
				value: result.value.name
			}))
		);
	}
}
