import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('guild')
		.addColumn('overview_sort', 'varchar(16)', (col) => col.notNull().defaultTo('month'))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('guild').dropColumn('overview_sort').execute();
}
