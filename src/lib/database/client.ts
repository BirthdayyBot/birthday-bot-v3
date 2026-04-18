import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { Database } from './Database.js';

function createDatabasePool() {
	const url = process.env.DB_URL;
	if (url) return createPool(url);
	return createPool({
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		supportBigNumbers: true,
		bigNumberStrings: false
	});
}

export const db = new Kysely<Database>({
	dialect: new MysqlDialect({ pool: createDatabasePool() })
});
