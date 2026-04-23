import { container } from '@sapphire/framework';
import { URL } from 'node:url';

export const ZeroWidthSpace = '\u200B';

export const rootFolder = new URL('../../../', import.meta.url);
export const srcFolder = new URL('src/', rootFolder);

export const projectRoot = new URL(process.env.OVERRIDE_ROOT_PATH ?? 'dist', rootFolder);
export const languagesFolder = new URL('languages/', projectRoot);

export enum Emojis {
	Success = '<:checkmark_square_birthdayy:1102222019476586526>',
	Fail = '<:cross_square_birthdayy:1102222032155988068> ',
	ArrowRight = '<:arrow_right_birthdayy:1102221944016875650>',
	ArrowLeft = '<:arrow_left_birthdayy:1102221941223477268>',
	Plus = '<:plus_birthdayy:1102222100544110712>',
	Link = '<:link_birthdayy:1102222076380725319>',
	Info = '<:exclamation_mark_birthdayy:1102222058777223209>',
	Cake = '<:cake_birthdayy:1102221988380020766>',
	Crown = '<:crown_birthdayy:1102222034458660915>',
	News = '<:news_birthdayy:1102222080029761618>',
	Gift = '<:gift_birthdayy:1102222060845015050>',
	Book = '<:book_birthdayy:1102221958592086137>',
	Alarm = '<:bell_birthdayy:1102221947003219968>',
	Support = '<:support_birthdayy:1102222115056386208>',
	Sign = '<:sign_birthdayy:1102222111155703909> ',
	Heart = '<:heart_birthdayy:1102222063030239232>',
	Ping = '<:ping_birthdayy:1102222097788440657>',
	People = '<:people_birthdayy:1102222095573844108>',
	Comment = '<:speech_bubble_birthdayy:1102222112711786577>',
	Online = '<:online_birthdayy:1102222090712657930>',
	Offline = '<:offline_birthdayy:1102222087973769368>',
	Warning = '<:warning_birthdayy:1102222123809906778>',
	Compass = '<:compass_birthdayy:1102222027101839360>',
	Tools = '<:tools_birthdayy:1102222421651623936>'
}

const customEmojiRegex = /^<a?:[a-zA-Z0-9_]+:(\d+)>\s*$/;

const emojiFallbacks: Record<keyof typeof Emojis, string> = {
	Success: '✅',
	Fail: '❌',
	ArrowRight: '➡️',
	ArrowLeft: '⬅️',
	Plus: '➕',
	Link: '🔗',
	Info: 'ℹ️',
	Cake: '🎂',
	Crown: '👑',
	News: '📰',
	Gift: '🎁',
	Book: '📘',
	Alarm: '🔔',
	Support: '🛟',
	Sign: '🪧',
	Heart: '❤️',
	Ping: '📡',
	People: '👥',
	Comment: '💬',
	Online: '🟢',
	Offline: '⚪',
	Warning: '⚠️',
	Compass: '🧭',
	Tools: '🛠️'
};

const emojiKeyByValue = new Map<string, keyof typeof Emojis>(Object.entries(Emojis).map(([key, value]) => [value, key as keyof typeof Emojis]));

export function getCustomEmojiId(emoji: string): string | null {
	const match = customEmojiRegex.exec(emoji);
	return match?.[1] ?? null;
}

export function resolveEmoji(emoji: Emojis): string {
	const id = getCustomEmojiId(emoji);
	if (!id) return emoji;

	if (container.client.emojis.cache.has(id)) return emoji;

	const key = emojiKeyByValue.get(emoji);
	return key ? emojiFallbacks[key] : '❔';
}

export function getMissingCustomEmojis(): Array<{ key: keyof typeof Emojis; id: string; fallback: string }> {
	const missing: Array<{ key: keyof typeof Emojis; id: string; fallback: string }> = [];

	for (const [key, value] of Object.entries(Emojis) as Array<[keyof typeof Emojis, Emojis]>) {
		const id = getCustomEmojiId(value);
		if (!id) continue;
		if (container.client.emojis.cache.has(id)) continue;

		missing.push({ key, id, fallback: emojiFallbacks[key] });
	}

	return missing;
}

export const enum LanguageFormatters {
	Duration = 'duration',
	Number = 'number',
	NumberCompact = 'numberCompact',
	Permissions = 'permissions',
	HumanLevels = 'humanLevels',
	ExplicitContentFilter = 'explicitContentFilter',
	MessageNotifications = 'messageNotifications',
	DateTime = 'dateTime',
	HumanDateTime = 'humanDateTime'
}

export enum CdnUrls {
	Cake = 'https://media.discordapp.net/attachments/931273194160160829/931273371889586226/cake.png',
	CupCake = 'https://cdn.discordapp.com/avatars/916434908728164372/8107b2ca04a252947eeffef4692346f0.png?size=128'
}

export enum GuildIDEnum {
	Birthdayy = '934467365389893704',
	ChilliHQ = '766707453994729532',
	ChilliAttackV2 = '768556541439377438',
	BirthdayyTesting = '980559116076470272'
}
