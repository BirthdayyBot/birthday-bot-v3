import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Manage birthday registrations'
})
export class BirthdayCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			this.hooks.subcommands(
				this,
				applyDescriptionLocalizedBuilder(
					builder
						.setName(this.name)
						.setDescription(this.description)
						.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
						.setContexts(InteractionContextType.Guild),
					LanguageKeys.Commands.Birthday.CommandDescription
				)
			)
		);
	}
}
