import { sql, type Kysely } from 'kysely';
import { getTimeZone } from '../lib/utilities/tz.js';

interface GuildRow {
	timezone: string;
}

const FALLBACK_IANA = 'Europe/London';

const OFFSET_TO_IANA: Record<number, string> = {
	[-11]: 'Pacific/Samoa',
	[-10]: 'Pacific/Honolulu',
	[-9]: 'America/Anchorage',
	[-8]: 'America/Los_Angeles',
	[-7]: 'America/Denver',
	[-6]: 'America/Chicago',
	[-5]: 'America/New_York',
	[-4]: 'America/Caracas',
	[-3]: 'America/Argentina/Buenos_Aires',
	[-2]: 'Atlantic/South_Georgia',
	[-1]: 'Atlantic/Azores',
	0: 'Europe/London',
	1: 'Europe/Paris',
	2: 'Europe/Berlin',
	3: 'Europe/Moscow',
	4: 'Asia/Dubai',
	5: 'Asia/Karachi',
	6: 'Asia/Dhaka',
	7: 'Asia/Jakarta',
	8: 'Asia/Shanghai',
	9: 'Asia/Tokyo',
	10: 'Australia/Brisbane',
	11: 'Pacific/Noumea',
	12: 'Pacific/Fiji'
};

function resolveIana(timezone: string): string {
	const hours = parseInt(timezone, 10);
	const candidate = isNaN(hours) ? timezone : (OFFSET_TO_IANA[hours] ?? FALLBACK_IANA);
	return getTimeZone(candidate) ? candidate : FALLBACK_IANA;
}

export async function up(db: Kysely<unknown>): Promise<void> {
	// MySQL converts integer column values to their string representation during this ALTER
	await sql`ALTER TABLE guild MODIFY COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/London'`.execute(db);

	const rows = await (db as Kysely<{ guild: GuildRow }>).selectFrom('guild').select('timezone').distinct().execute();

	for (const { timezone } of rows) {
		await (db as Kysely<{ guild: GuildRow }>)
			.updateTable('guild')
			.set({ timezone: resolveIana(timezone) })
			.where('timezone', '=', timezone)
			.execute();
	}
}

export async function down(db: Kysely<unknown>): Promise<void> {
	// MySQL silently converts non-numeric strings to 0 - all rows revert to offset 0
	await sql`ALTER TABLE guild MODIFY COLUMN timezone INTEGER NOT NULL DEFAULT 0`.execute(db);
}
