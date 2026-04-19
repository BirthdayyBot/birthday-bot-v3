import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('birthday')
		.addColumn('hide_age', 'boolean', (col) => col.notNull().defaultTo(false))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('birthday').dropColumn('hide_age').execute();
}
