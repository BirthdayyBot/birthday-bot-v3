import { Emojis, resolveEmoji } from '#utils/constants';
import {
	EmbedBuilder,
	type APIEmbedField,
	type APIUser,
	type ColorResolvable,
	type InteractionEditReplyOptions,
	type InteractionReplyOptions,
	type MessageEditOptions,
	type MessageReplyOptions,
	type User
} from 'discord.js';

type EmbedTone = 'success' | 'error' | 'warning' | 'info';

enum EmbedColors {
	Success = 0x57f287,
	Error = 0xed4245,
	Warning = 0xfee75c,
	Info = 0x5865f2
}

function parsePrimaryColorFromEnv(fallback: ColorResolvable): ColorResolvable {
	const raw = process.env.BOT_PRIMARY_COLOR;
	if (!raw) return fallback;

	const normalized = raw.trim();
	if (!/^#?[0-9a-fA-F]{6}$/.test(normalized)) return fallback;

	return Number.parseInt(normalized.replace('#', ''), 16);
}

const primaryEmbedColor = parsePrimaryColorFromEnv(EmbedColors.Info);

const toneConfig: Record<EmbedTone, { color: ColorResolvable; icon: Emojis }> = {
	success: { color: EmbedColors.Success, icon: Emojis.Success },
	error: { color: EmbedColors.Error, icon: Emojis.Fail },
	warning: { color: EmbedColors.Warning, icon: Emojis.Warning },
	info: { color: primaryEmbedColor, icon: Emojis.Info }
};

export function createDefaultEmbed(description: string, tone: EmbedTone = 'info') {
	const config = toneConfig[tone];

	return new EmbedBuilder()
		.setColor(config.color)
		.setDescription(`${resolveEmoji(config.icon)} ${description}`)
		.setTimestamp();
}

export function createOverviewEmbed(title: string, fields: APIEmbedField[], tone: EmbedTone = 'info', description?: string) {
	const config = toneConfig[tone];
	const embed = new EmbedBuilder()
		.setColor(config.color)
		.setTitle(`${resolveEmoji(config.icon)} ${title}`)
		.setTimestamp();

	if (description) {
		embed.setDescription(description);
	}

	return embed.addFields(fields);
}

export function createListEmbed(title: string, entries: string[], tone: EmbedTone = 'info') {
	const config = toneConfig[tone];
	const content = entries.map((entry) => `- ${entry}`).join('\n');

	return new EmbedBuilder()
		.setColor(config.color)
		.setTitle(`${resolveEmoji(config.icon)} ${title}`)
		.setDescription(content)
		.setTimestamp();
}

export function createDefaultInteractionReply(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionReplyOptions, 'content' | 'embeds'> = {},
	tone: EmbedTone = 'info'
): InteractionReplyOptions {
	return {
		embeds: [createDefaultEmbed(description, tone)],
		allowedMentions: { users: [user.id], roles: [] },
		...options
	};
}

export function createDefaultMessageReply(
	description: string,
	options: Omit<MessageReplyOptions, 'content' | 'embeds'> = {},
	tone: EmbedTone = 'info'
): MessageReplyOptions {
	return {
		embeds: [createDefaultEmbed(description, tone)],
		...options
	};
}

export function createDefaultInteractionEditReply(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionEditReplyOptions, 'content' | 'embeds'> = {},
	tone: EmbedTone = 'info'
): InteractionEditReplyOptions {
	return {
		embeds: [createDefaultEmbed(description, tone)],
		allowedMentions: { users: [user.id], roles: [] },
		...options
	};
}

export function createDefaultMessageEdit(
	description: string,
	options: Omit<MessageEditOptions, 'content' | 'embeds'> = {},
	tone: EmbedTone = 'info'
): MessageEditOptions {
	return {
		embeds: [createDefaultEmbed(description, tone)],
		...options
	};
}

export function editReplySuccess(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionEditReplyOptions, 'content' | 'embeds'> = {}
): InteractionEditReplyOptions {
	return createDefaultInteractionEditReply(description, user, options, 'success');
}

export function editReplyError(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionEditReplyOptions, 'content' | 'embeds'> = {}
): InteractionEditReplyOptions {
	return createDefaultInteractionEditReply(description, user, options, 'error');
}

export function editReplyWarning(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionEditReplyOptions, 'content' | 'embeds'> = {}
): InteractionEditReplyOptions {
	return createDefaultInteractionEditReply(description, user, options, 'warning');
}

export function editReplyInfo(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionEditReplyOptions, 'content' | 'embeds'> = {}
): InteractionEditReplyOptions {
	return createDefaultInteractionEditReply(description, user, options, 'info');
}

export function replySuccess(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionReplyOptions, 'content' | 'embeds'> = {}
): InteractionReplyOptions {
	return createDefaultInteractionReply(description, user, { ephemeral: true, ...options }, 'success');
}

export function replyError(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionReplyOptions, 'content' | 'embeds'> = {}
): InteractionReplyOptions {
	return createDefaultInteractionReply(description, user, { ephemeral: true, ...options }, 'error');
}

export function replyWarning(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionReplyOptions, 'content' | 'embeds'> = {}
): InteractionReplyOptions {
	return createDefaultInteractionReply(description, user, { ephemeral: true, ...options }, 'warning');
}

export function replyInfo(
	description: string,
	user: User | APIUser,
	options: Omit<InteractionReplyOptions, 'content' | 'embeds'> = {}
): InteractionReplyOptions {
	return createDefaultInteractionReply(description, user, { ephemeral: true, ...options }, 'info');
}
