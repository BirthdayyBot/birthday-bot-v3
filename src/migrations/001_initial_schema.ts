import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable('user')
		.ifNotExists()
		.addColumn('user_id', 'varchar(32)', (col) => col.primaryKey().notNull())
		.addColumn('username', 'varchar(32)')
		.addColumn('discriminator', 'varchar(4)')
		.addColumn('premium', 'boolean', (col) => col.notNull().defaultTo(false))
		.addColumn('last_updated', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await db.schema
		.createTable('guild')
		.ifNotExists()
		.addColumn('guild_id', 'varchar(32)', (col) => col.primaryKey().notNull())
		.addColumn('inviter', 'varchar(20)')
		.addColumn('announcement_channel', 'varchar(20)')
		.addColumn('announcement_message', 'varchar(512)', (col) =>
			col.notNull().defaultTo('<:arrwright:931267038746390578> Today is a special Day!{NEW_LINE}<:gift:931267039094534175> Please wish {MENTION} a happy Birthday <3')
		)
		.addColumn('overview_channel', 'varchar(20)')
		.addColumn('overview_message', 'varchar(20)')
		.addColumn('birthday_role', 'varchar(20)')
		.addColumn('birthday_ping_role', 'varchar(20)')
		.addColumn('log_channel', 'varchar(20)')
		.addColumn('timezone', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('premium', 'boolean', (col) => col.notNull().defaultTo(false))
		.addColumn('language', 'varchar(5)', (col) => col.notNull().defaultTo('en-US'))
		.addColumn('last_updated', 'timestamp', (col) => col.defaultTo(sql`now()`))
		.addColumn('disabled', 'boolean', (col) => col.notNull().defaultTo(false))
		.execute();

	await db.schema
		.createTable('birthday')
		.ifNotExists()
		.addColumn('id', 'bigint', (col) => col.primaryKey().autoIncrement().notNull())
		.addColumn('user_id', 'varchar(32)', (col) => col.notNull())
		.addColumn('guild_id', 'varchar(32)', (col) => col.notNull())
		.addColumn('birthday', 'varchar(10)', (col) => col.notNull())
		.addColumn('disabled', 'boolean', (col) => col.notNull().defaultTo(false))
		.addUniqueConstraint('unique_user_guild', ['user_id', 'guild_id'])
		.execute();

	await db.schema.createIndex('index_birthday_birthday').on('birthday').column('birthday').execute();
	await db.schema.createIndex('index_guild_id_birthday').on('birthday').column('guild_id').execute();
	await db.schema.createIndex('index_user_id_birthday').on('birthday').column('user_id').execute();
	await db.schema.createIndex('index_last_updated_guild').on('guild').column('last_updated').execute();
	await db.schema.createIndex('index_user_birthday').on('user').column('username').execute();

	await db.schema
		.createTable('blacklist')
		.ifNotExists()
		.addColumn('id', 'bigint', (col) => col.primaryKey().autoIncrement().notNull())
		.addColumn('guild_id', 'varchar(32)', (col) => col.notNull())
		.addColumn('user_id', 'varchar(32)', (col) => col.notNull())
		.addColumn('added_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn('disabled', 'boolean', (col) => col.notNull().defaultTo(false))
		.addUniqueConstraint('unique_user_guild_blacklist', ['user_id', 'guild_id'])
		.execute();

	await db.schema.createIndex('index_guild_id_blacklist').on('blacklist').column('guild_id').execute();
	await db.schema.createIndex('index_user_id_blacklist').on('blacklist').column('user_id').execute();

	await db.schema
		.createTable('premium')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
		.addColumn('user_id', 'varchar(32)', (col) => col.notNull())
		.addColumn('guild_id', 'varchar(32)')
		.addColumn('tier', 'boolean', (col) => col.notNull().defaultTo(true))
		.execute();

	await db.schema
		.createTable('tiers')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
		.addColumn('name', 'varchar(512)')
		.addColumn('last_updated', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('birthday').ifExists().execute();
	await db.schema.dropTable('blacklist').ifExists().execute();
	await db.schema.dropTable('premium').ifExists().execute();
	await db.schema.dropTable('tiers').ifExists().execute();
	await db.schema.dropTable('guild').ifExists().execute();
	await db.schema.dropTable('user').ifExists().execute();
}