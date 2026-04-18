import { OWNERS } from '#root/config';
import { rootFolder, ZeroWidthSpace } from '#utils/constants';
import { createDefaultInteractionEditReply, createDefaultInteractionReply } from '#lib/utilities/default-embed';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { resolveKey } from '@sapphire/plugin-i18next';
import {
	ArgumentError,
	container,
	Events,
	UserError,
	type ChatInputCommandErrorPayload,
	type Command,
	type ContextMenuCommandErrorPayload
} from '@sapphire/framework';
import { codeBlock, filterNullish, isNullish } from '@sapphire/utilities';
import {
	BaseInteraction,
	bold,
	ChatInputCommandInteraction,
	DiscordAPIError,
	EmbedBuilder,
	hideLinkEmbed,
	HTTPError,
	hyperlink,
	RESTJSONErrorCodes,
	userMention,
	type APIMessage,
	type CommandInteraction,
	type ContextMenuCommandInteraction,
	type Message
} from 'discord.js';
import { fileURLToPath } from 'node:url';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export async function handleChatInputOrContextMenuCommandError(
	error: Error,
	{ command, interaction }: ChatInputCommandErrorPayload | ContextMenuCommandErrorPayload
) {
	// If the error was a string or an UserError, send it to the user:
	if (typeof error === 'string') return stringError(interaction, error);
	if (error instanceof ArgumentError) return argumentError(interaction, error);
	if (error instanceof UserError) return userError(interaction, error);

	const { client, logger } = container;
	// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
	if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
		logger.warn(`${getWarnError(interaction)} (${interaction.user.id}) | ${error.constructor.name}`);
		return alert(interaction, await resolveKey(interaction, LanguageKeys.Errors.GenericDiscordGateway));
	}

	// Extract useful information about the DiscordAPIError
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		if (ignoredCodes.includes(error.status)) {
			return;
		}

		client.emit(Events.Error, error);
	} else {
		logger.warn(`${getWarnError(interaction)} (${interaction.user.id}) | ${error.constructor.name}`);
	}

	// Send a detailed message:
	await sendErrorChannel(interaction, command, error);

	// Emit where the error was emitted
	logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack || error.message}`);
	try {
		await alert(interaction, await generateUnexpectedErrorMessage(interaction, error));
	} catch (err) {
		client.emit(Events.Error, err as Error);
	}

	return undefined;
}

async function generateUnexpectedErrorMessage(interaction: CommandInteraction, error: Error) {
	if (OWNERS.includes(interaction.user.id)) return codeBlock('js', error.stack!);
	return resolveKey(interaction, LanguageKeys.Errors.UnexpectedIssue);
}

function stringError(interaction: CommandInteraction, error: string) {
	return alert(interaction, `Dear ${userMention(interaction.user.id)}, ${error}`);
}

function argumentError(interaction: CommandInteraction, error: ArgumentError<unknown>) {
	return alert(
		interaction,
		error.message ||
			`An error occurred that I was not able to identify. Please try again. If the issue keeps showing up, you can get in touch with the developers by joining my support server through ${hideLinkEmbed(
				'https://birthdayy.xyz/discord'
			)}`
	);
}

function userError(interaction: CommandInteraction, error: UserError) {
	if (Reflect.get(Object(error.context), 'silent')) return;

	return alert(
		interaction,
		error.message ||
			`An error occurred that I was not able to identify. Please try again. If the issue keeps showing up, you can get in touch with the developers by joining my support server through ${hideLinkEmbed(
				'https://birthdayy.xyz/discord'
			)}`
	);
}

async function alert(interaction: CommandInteraction, content: string) {
	if (interaction.replied || interaction.deferred) {
		return interaction.editReply(createDefaultInteractionEditReply(content, interaction.user, {}, 'error'));
	}

	return interaction.reply(createDefaultInteractionReply(content, interaction.user, { ephemeral: true }, 'error'));
}

async function sendErrorChannel(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, command: Command, error: Error) {
	const webhook = container.webhookError;
	if (isNullish(webhook)) return;

	const interactionReply = await interaction.fetchReply();

	const lines = [
		getLinkLine(interactionReply),
		getCommandLine(command),
		interaction instanceof ChatInputCommandInteraction ? getOptionsLine(interaction.options) : null,
		getErrorLine(error)
	].filter(filterNullish);

	// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		lines.splice(2, 0, getMethodLine(error), getStatusLine(error));
	}

	const embed = new EmbedBuilder().setDescription(lines.join('\n')).setColor('Red').setTimestamp();

	try {
		await webhook.send({ embeds: [embed] });
	} catch (err) {
		container.client.emit(Events.Error, err as Error);
	}
}

function getCommandLine(command: Command): string {
	return `**Command**: ${command.location.full.slice(fileURLToPath(rootFolder).length)}`;
}

function getOptionsLine(options: ChatInputCommandInteraction['options']): string {
	if (options.data.length === 0) return '**Options**: Not Supplied';

	const mappedOptions = options.data.map((option) => {
		let { value } = option;
		if (typeof value === 'string') value = value.trim().replaceAll('`', '῾');
		return `[${option.name} ⫸ ${value || ZeroWidthSpace}]`;
	});

	return `**Options**: ${mappedOptions.join('\n')}`;
}

export function getLinkLine(message: APIMessage | Message): string {
	if (isMessageInstance(message)) {
		return bold(hyperlink('Jump to Message!', hideLinkEmbed(message.url)));
	}

	return '';
}

export function getMethodLine(error: DiscordAPIError | HTTPError): string {
	return `**Path**: ${error.method.toUpperCase()}`;
}

export function getStatusLine(error: DiscordAPIError | HTTPError): string {
	return `**Status**: ${error.status}`;
}

export function getErrorLine(error: Error): string {
	return `**Error**: ${codeBlock('js', error.stack || error.message)}`;
}

export function getWarnError(interaction: BaseInteraction) {
	return `ERROR: /${interaction.guildId}/${interaction.channelId}/${interaction.id}`;
}
