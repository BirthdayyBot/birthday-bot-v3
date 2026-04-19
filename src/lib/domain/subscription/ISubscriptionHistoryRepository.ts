import type { SubscriptionHistory, SubscriptionSource } from './SubscriptionHistory.js';

export interface ISubscriptionHistoryRepository {
	findByUserId(userId: string, limit?: number): Promise<SubscriptionHistory[]>;
	findActiveByUserId(userId: string): Promise<SubscriptionHistory | null>;
	start(data: {
		userId: string;
		tier: string;
		slots: number;
		source: SubscriptionSource;
		startedAt?: Date;
		expiresAt?: Date | null;
	}): Promise<void>;
	end(userId: string): Promise<void>;
	findExpired(): Promise<SubscriptionHistory[]>;
}
