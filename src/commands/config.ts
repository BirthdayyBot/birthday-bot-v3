import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';
import { ConfigViewController } from '#lib/application/config-commands/ConfigViewController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { handleButton, handleChannelSelect, handleRoleSelect, handleStringSelect } from '#lib/config-view/handlers';
import { resolveLabels } from '#lib/config-view/labels';
import { buildMainRow, buildMainView } from '#lib/config-view/panels';
import { VIEW_TIMEOUT_MS, type PanelContext } from '#lib/config-view/types';
import { ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Configure guild settings'
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
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const ctx: PanelContext = {
			guildId,
			labels: await resolveLabels(interaction),
			viewController: new ConfigViewController(this.container.guild),
			guildRepository: this.container.guild,
			interaction
		};

		const initialView = await buildMainView(ctx);
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
			if (component.isButton()) await handleButton(component, ctx);
			else if (component.isStringSelectMenu()) await handleStringSelect(component, ctx);
			else if (component.isChannelSelectMenu()) await handleChannelSelect(component, ctx);
			else if (component.isRoleSelectMenu()) await handleRoleSelect(component, ctx);
		});

		collector.on('end', async () => {
			try {
				await interaction.editReply({ components: [buildMainRow(ctx.labels, true)] });
			} catch {}
		});
	}
}
