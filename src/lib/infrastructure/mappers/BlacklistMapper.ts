import type { Selectable } from 'kysely';
import { BlacklistEntry } from '#lib/domain/blacklist/BlacklistEntry';
import type { BlacklistTable } from '#lib/database/types';

export function toBlacklistEntryEntity(row: Selectable<BlacklistTable>): BlacklistEntry {
	return new BlacklistEntry({
		id: row.id,
		guildId: row.guild_id,
		userId: row.user_id,
		addedAt: row.added_at,
		disabled: row.disabled
	});
}
