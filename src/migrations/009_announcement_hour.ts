import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('guild')
		.addColumn('announcement_hour', 'integer', (col) => col.notNull().defaultTo(9))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('guild').dropColumn('announcement_hour').execute();
}
