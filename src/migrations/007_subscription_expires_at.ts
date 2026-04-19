import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('subscription_history').addColumn('expires_at', 'datetime').execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('subscription_history').dropColumn('expires_at').execute();
}
