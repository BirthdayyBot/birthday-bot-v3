import type { Selectable } from 'kysely';
import { SubscriptionHistory, type SubscriptionSource } from '#lib/domain/subscription/SubscriptionHistory';
import type { SubscriptionHistoryTable } from '#lib/database/types';

export function toSubscriptionHistoryEntity(row: Selectable<SubscriptionHistoryTable>): SubscriptionHistory {
	return new SubscriptionHistory({
		id: row.id,
		userId: row.user_id,
		tier: row.tier,
		slots: row.slots,
		source: row.source as SubscriptionSource,
		startedAt: row.started_at,
		endedAt: row.ended_at,
		expiresAt: row.expires_at
	});
}
