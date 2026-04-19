import type { User } from './User.js';

export interface IUserRepository {
	findById(userId: string): Promise<User | null>;
	upsert(data: { userId: string; username?: string | null; discriminator?: string | null; lastUpdated: Date }): Promise<void>;
	setPremium(userId: string, premium: boolean): Promise<void>;
	setPatreonSlots(userId: string, maxSlots: number): Promise<void>;
}
