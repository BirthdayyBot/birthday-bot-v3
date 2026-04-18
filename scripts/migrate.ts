import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../src/lib/database/client.js';

const migrationFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/migrations');

const migrator = new Migrator({
	db,
	provider: new FileMigrationProvider({ fs, path, migrationFolder })
});

const command = process.argv[2] ?? 'up';

const { error, results } =
	command === 'down' ? await migrator.migrateDown() : await migrator.migrateToLatest();

for (const result of results ?? []) {
	const label = result.status === 'Success' ? '✓' : result.status === 'Error' ? '✗' : '~';
	console.log(`${label} ${result.direction} ${result.migrationName}`);
}

if (error) {
	console.error('Migration failed:', error);
	process.exit(1);
}

await db.destroy();
