import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';
import { ConfigViewController } from '#lib/application/config-commands/ConfigViewController';
import { ConfigPageRunner } from '#lib/config-view/ConfigPageRunner';
import { VIEW_TIMEOUT_MS, type PageContext } from '#lib/config-view/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Configure guild settings',
	preconditions: ['GuildOnly']
})
export class ConfigCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(
				builder
					.setName(this.name)
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
					.setContexts(InteractionContextType.Guild),
				LanguageKeys.Commands.Config.CommandDescription
			)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = interaction.guildId!;
		const runner = new ConfigPageRunner();

		let ctx: PageContext = {
			guildId,
			userId: interaction.user.id,
			currentPage: 'main',
			navigation: ['main'],
			params: {},
			viewController: new ConfigViewController(this.container.guild),
			guildRepository: this.container.guild,
			interaction
		};

		const initialView = await runner.renderPage('main', ctx);
		await interaction.reply({
			embeds: initialView.embeds,
			components: initialView.components,
			ephemeral: false,
			allowedMentions: { users: [interaction.user.id], roles: [] }
		});

		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({
			time: VIEW_TIMEOUT_MS,
			filter: (i) => i.user.id === interaction.user.id
		});

		collector.on('collect', async (component) => {
			ctx = await runner.routeInteraction(component, ctx);
		});

		collector.on('end', async () => {
			try {
				await interaction.editReply({ components: [] });
			} catch {}
		});
	}
}
