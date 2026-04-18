import type { BlacklistEntry } from './BlacklistEntry.js';

export interface IBlacklistRepository {
	findActiveByGuildId(guildId: string): Promise<BlacklistEntry[]>;
	findActiveByUserAndGuild(userId: string, guildId: string): Promise<BlacklistEntry | null>;
	add(data: { guildId: string; userId: string; addedAt: Date }): Promise<void>;
	setDisabled(userId: string, guildId: string, disabled: boolean): Promise<void>;
}
