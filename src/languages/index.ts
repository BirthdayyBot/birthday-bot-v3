import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as EnUsHandler } from '#root/languages/en-US/constants';
import { Locale } from 'discord.js';

export const handlers = new Map<Locale, Handler>([[Locale.EnglishUS, new EnUsHandler()]]);

export function getHandler(name: Locale): Handler {
	return handlers.get(name) ?? handlers.get(Locale.EnglishUS)!;
}
