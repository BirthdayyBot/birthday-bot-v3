import type { Kysely } from 'kysely';
import type { ISubscriptionHistoryRepository } from '#lib/domain/subscription/ISubscriptionHistoryRepository';
import type { SubscriptionHistory, SubscriptionSource } from '#lib/domain/subscription/SubscriptionHistory';
import type { Database } from '#lib/database/Database';
import { toSubscriptionHistoryEntity } from '#lib/infrastructure/mappers/SubscriptionHistoryMapper';

export class KyselySubscriptionHistoryRepository implements ISubscriptionHistoryRepository {
	readonly #db: Kysely<Database>;

	public constructor(db: Kysely<Database>) {
		this.#db = db;
	}

	public async findByUserId(userId: string, limit = 10): Promise<SubscriptionHistory[]> {
		const rows = await this.#db
			.selectFrom('subscription_history')
			.selectAll()
			.where('user_id', '=', userId)
			.orderBy('started_at', 'desc')
			.limit(limit)
			.execute();
		return rows.map(toSubscriptionHistoryEntity);
	}

	public async findActiveByUserId(userId: string): Promise<SubscriptionHistory | null> {
		const row = await this.#db
			.selectFrom('subscription_history')
			.selectAll()
			.where('user_id', '=', userId)
			.where('ended_at', 'is', null)
			.orderBy('started_at', 'desc')
			.executeTakeFirst();
		return row ? toSubscriptionHistoryEntity(row) : null;
	}

	public async start(data: { userId: string; tier: string; slots: number; source: SubscriptionSource }): Promise<void> {
		await this.#db
			.insertInto('subscription_history')
			.values({ user_id: data.userId, tier: data.tier, slots: data.slots, source: data.source })
			.execute();
	}

	public async end(userId: string): Promise<void> {
		await this.#db
			.updateTable('subscription_history')
			.set({ ended_at: new Date() })
			.where('user_id', '=', userId)
			.where('ended_at', 'is', null)
			.execute();
	}
}
