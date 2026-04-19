import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('user')
		.addColumn('patreon_max_slots', 'integer', (col) => col.notNull().defaultTo(0))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('user').dropColumn('patreon_max_slots').execute();
}
