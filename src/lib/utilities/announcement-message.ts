import { EmbedBuilder, userMention, type Guild, type GuildMember, type MessageCreateOptions } from 'discord.js';

export const ANNOUNCEMENT_PLACEHOLDERS = {
	MENTION: '{MENTION}',
	NEW_LINE: '{NEW_LINE}',
	USERNAME: '{USERNAME}',
	DISCRIMINATOR: '{DISCRIMINATOR}',
	GUILD_NAME: '{GUILD_NAME}',
	GUILD_ID: '{GUILD_ID}',
	SERVERNAME: '{SERVERNAME}'
} as const;

export const REQUIRED_ANNOUNCEMENT_PLACEHOLDERS = [ANNOUNCEMENT_PLACEHOLDERS.MENTION] as const;

export interface AnnouncementMessageReplacements {
	mention: string;
	newLine?: string;
}

export function renderAnnouncementMessage(template: string, replacements: AnnouncementMessageReplacements): string {
	const lineBreak = replacements.newLine ?? '\n';

	return template.replaceAll(ANNOUNCEMENT_PLACEHOLDERS.MENTION, replacements.mention).replaceAll(ANNOUNCEMENT_PLACEHOLDERS.NEW_LINE, lineBreak);
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatBirthdayMessage(message: string, member: GuildMember, guild: Guild): string {
	const placeholders = {
		[ANNOUNCEMENT_PLACEHOLDERS.USERNAME]: member.user.username,
		[ANNOUNCEMENT_PLACEHOLDERS.DISCRIMINATOR]: member.user.discriminator,
		[ANNOUNCEMENT_PLACEHOLDERS.NEW_LINE]: '\n',
		[ANNOUNCEMENT_PLACEHOLDERS.GUILD_NAME]: guild.name,
		[ANNOUNCEMENT_PLACEHOLDERS.GUILD_ID]: guild.id,
		[ANNOUNCEMENT_PLACEHOLDERS.MENTION]: userMention(member.id),
		[ANNOUNCEMENT_PLACEHOLDERS.SERVERNAME]: guild.name
	} as const;

	let formattedMessage = message;
	for (const [placeholder, value] of Object.entries(placeholders)) {
		formattedMessage = formattedMessage.replace(new RegExp(escapeRegExp(placeholder), 'gi'), value);
	}

	return formattedMessage;
}

export interface BirthdayAnnouncementConfig {
	announcementMessage: string;
	birthdayPingRole: string | null;
}

interface SendBirthdayAnnouncementParams {
	guild: Guild;
	channel: { send: (options: MessageCreateOptions) => Promise<unknown> };
	userId: string;
	config: BirthdayAnnouncementConfig;
	member?: GuildMember | null;
	embedTitle?: string;
}

const BIRTHDAY_EMBED_COLOR = 0xff8a3d;
const DEFAULT_BIRTHDAY_EMBED_TITLE = 'Happy Birthday!';

export async function sendBirthdayAnnouncement({
	guild,
	channel,
	userId,
	config,
	member,
	embedTitle
}: SendBirthdayAnnouncementParams): Promise<GuildMember | null> {
	const resolvedMember = member ?? (await guild.members.fetch(userId).catch(() => null));
	const message = resolvedMember
		? formatBirthdayMessage(config.announcementMessage, resolvedMember, guild)
		: renderAnnouncementMessage(config.announcementMessage, {
				mention: `<@${userId}>`
			});

	const roleMention = config.birthdayPingRole ? `<@&${config.birthdayPingRole}>` : undefined;
	const embed = new EmbedBuilder()
		.setColor(BIRTHDAY_EMBED_COLOR)
		.setTitle(embedTitle ?? DEFAULT_BIRTHDAY_EMBED_TITLE)
		.setDescription(message)
		.setFooter({ text: guild.name, iconURL: guild.iconURL() ?? undefined });

	if (resolvedMember) {
		embed.setThumbnail(resolvedMember.displayAvatarURL());
	}

	await channel.send({
		content: roleMention,
		embeds: [embed],
		allowedMentions: {
			users: [userId],
			roles: config.birthdayPingRole ? [config.birthdayPingRole] : []
		}
	});

	return resolvedMember;
}
