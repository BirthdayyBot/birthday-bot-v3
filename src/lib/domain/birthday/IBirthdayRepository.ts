import type { Birthday } from './Birthday.js';

export interface IBirthdayRepository {
	findByUserId(userId: string): Promise<Birthday[]>;
	findByGuildId(guildId: string): Promise<Birthday[]>;
	findByUserAndGuild(userId: string, guildId: string): Promise<Birthday | null>;
	findActiveByGuildId(guildId: string): Promise<Birthday[]>;
	upsert(data: { userId: string; guildId: string; birthday: string }): Promise<void>;
	setDisabled(userId: string, guildId: string, disabled: boolean): Promise<void>;
	delete(userId: string, guildId: string): Promise<void>;
}
