import type { SubscriptionHistory, SubscriptionSource } from './SubscriptionHistory.js';

export interface ISubscriptionHistoryRepository {
	findByUserId(userId: string, limit?: number): Promise<SubscriptionHistory[]>;
	findActiveByUserId(userId: string): Promise<SubscriptionHistory | null>;
	start(data: { userId: string; tier: string; slots: number; source: SubscriptionSource }): Promise<void>;
	end(userId: string): Promise<void>;
}
