import type { Selectable } from 'kysely';
import { Birthday } from '#lib/domain/birthday/Birthday';
import type { BirthdayTable } from '#lib/database/types';

export function toBirthdayEntity(row: Selectable<BirthdayTable>): Birthday {
	return new Birthday({
		id: row.id,
		userId: row.user_id,
		guildId: row.guild_id,
		birthday: row.birthday,
		disabled: row.disabled,
		hideAge: row.hide_age
	});
}
