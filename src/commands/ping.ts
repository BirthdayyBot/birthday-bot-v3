import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';
import { createDefaultEmbed, createDefaultMessageEdit, createDefaultMessageReply } from '#lib/utilities/default-embed';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class UserCommand extends Command {
	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		// Create shared integration types and contexts
		// These allow the command to be used in guilds and DMs
		const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
		const contexts: InteractionContextType[] = [
			InteractionContextType.BotDM,
			InteractionContextType.Guild,
			InteractionContextType.PrivateChannel
		];

		// Register Chat Input command
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(
				builder.setName(this.name).setDescription(this.description).setIntegrationTypes(integrationTypes).setContexts(contexts),
				LanguageKeys.Commands.Ping.CommandDescription
			)
		);

		// Register Context Menu command available from any message
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.Message,
			integrationTypes,
			contexts
		});

		// Register Context Menu command available from any user
		registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.User,
			integrationTypes,
			contexts
		});
	}

	// Message command
	public override async messageRun(message: Message) {
		return this.sendPing(message);
	}

	// Chat Input (slash) command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendPing(interaction);
	}

	// Context Menu command
	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.sendPing(interaction);
	}

	private async sendPing(interactionOrMessage: Message | Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
		const pingMessage =
			interactionOrMessage instanceof Message
				? interactionOrMessage.channel?.isSendable() &&
					(await interactionOrMessage.channel.send(createDefaultMessageReply('Checking heartbeat...', {}, 'info')))
				: (await interactionOrMessage.reply({ embeds: [createDefaultEmbed('Checking heartbeat...', 'info')] }),
					await interactionOrMessage.fetchReply());

		if (!pingMessage) return;

		const description = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			pingMessage.createdTimestamp - interactionOrMessage.createdTimestamp
		}ms.`;

		if (interactionOrMessage instanceof Message) {
			return pingMessage.edit(createDefaultMessageEdit(description, {}, 'success'));
		}

		return interactionOrMessage.editReply({
			embeds: [createDefaultEmbed(description, 'success')]
		});
	}
}
