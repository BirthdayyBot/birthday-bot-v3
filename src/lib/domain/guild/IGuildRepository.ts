import type { Guild } from './Guild.js';

export type GuildUpdateData = Partial<Omit<Guild, 'guildId'>>;

export interface IGuildRepository {
	findById(guildId: string): Promise<Guild | null>;
	upsert(data: Guild): Promise<void>;
	update(guildId: string, data: GuildUpdateData): Promise<void>;
	setDisabled(guildId: string, disabled: boolean): Promise<void>;
	delete(guildId: string): Promise<void>;
}
