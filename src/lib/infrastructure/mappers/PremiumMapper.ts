import type { Selectable } from 'kysely';
import { PremiumGrant } from '#lib/domain/premium/PremiumGrant';
import type { PremiumTable } from '#lib/database/types';

export function toPremiumGrantEntity(row: Selectable<PremiumTable>): PremiumGrant {
	return new PremiumGrant({
		id: row.id,
		userId: row.user_id,
		guildId: row.guild_id,
		tier: row.tier
	});
}
