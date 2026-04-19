import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Manage your Patreon premium subscription'
})
export class PremiumCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			this.hooks.subcommands(
				this,
				builder
					.setName(this.name)
					.setDescription(this.description)
					.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
					.setContexts(InteractionContextType.Guild)
			)
		);
	}
}
