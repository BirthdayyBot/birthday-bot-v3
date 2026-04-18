import type { Selectable } from 'kysely';
import { User } from '#lib/domain/user/User';
import type { UserTable } from '#lib/database/types';

export function toUserEntity(row: Selectable<UserTable>): User {
	return new User({
		userId: row.user_id,
		username: row.username,
		discriminator: row.discriminator,
		premium: row.premium,
		lastUpdated: row.last_updated
	});
}
