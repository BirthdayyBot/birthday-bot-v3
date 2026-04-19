import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable('subscription_history')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
		.addColumn('user_id', 'varchar(32)', (col) => col.notNull())
		.addColumn('tier', 'varchar(64)', (col) => col.notNull())
		.addColumn('slots', 'integer', (col) => col.notNull())
		.addColumn('source', 'varchar(16)', (col) => col.notNull().defaultTo('patreon'))
		.addColumn('started_at', 'datetime', (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn('ended_at', 'datetime')
		.execute();

	await db.schema.createIndex('index_user_id_subscription_history').on('subscription_history').column('user_id').execute();
	await db.schema.createIndex('index_started_at_subscription_history').on('subscription_history').column('started_at').execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('subscription_history').ifExists().execute();
}
