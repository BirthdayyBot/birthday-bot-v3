import type { Command } from '@sapphire/framework';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';
import type { ConfigViewController } from '#lib/application/config-commands/ConfigViewController';

export const VIEW_TIMEOUT_MS = 5 * 60 * 1000;

export interface PageContext {
	guildId: string;
	userId: string;
	currentPage: string;
	navigation: string[];
	params: Record<string, string>;
	viewController: ConfigViewController;
	guildRepository: IGuildRepository;
	interaction: Command.ChatInputCommandInteraction;
}
