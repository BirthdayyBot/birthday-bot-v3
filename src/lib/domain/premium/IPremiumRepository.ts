import type { PremiumGrant } from './PremiumGrant.js';

export interface IPremiumRepository {
	findByUserId(userId: string): Promise<PremiumGrant[]>;
	findByGuildId(guildId: string): Promise<PremiumGrant | null>;
	add(data: { userId: string; guildId?: string | null }): Promise<void>;
	removeByUserId(userId: string): Promise<void>;
	removeByGuildId(guildId: string): Promise<void>;
}
