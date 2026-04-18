import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { searchTimeZone } from '#lib/utilities/tz';
import { ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Configure guild settings'
})
export class ConfigCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			this.hooks.subcommands(
				this,
				applyDescriptionLocalizedBuilder(
					builder
						.setName(this.name)
						.setDescription(this.description)
						.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
						.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
						.setContexts(InteractionContextType.Guild),
					LanguageKeys.Commands.Config.CommandDescription
				)
			)
		);
	}

	public override async autocompleteRun(interaction: Subcommand.AutocompleteInteraction) {
		if (interaction.options.getSubcommand(false) !== 'timezone') {
			return interaction.respond([]);
		}

		const query = interaction.options.getFocused();
		const results = searchTimeZone(query);
		const response = await Promise.all(
			results.map(async (result) => ({
				name: await resolveKey(
					interaction,
					result.score === 1
						? LanguageKeys.Commands.Config.AutocompleteTimezoneExact
						: LanguageKeys.Commands.Config.AutocompleteTimezonePartial,
					{ timezone: result.value.full }
				),
				value: result.value.name
			}))
		);

		return interaction.respond(response);
	}
}
