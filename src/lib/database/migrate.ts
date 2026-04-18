import { db } from '#lib/database/client';
import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../migrations');

export async function migrateToLatest(): Promise<void> {
	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({ fs, path, migrationFolder })
	});

	const { error, results } = await migrator.migrateToLatest();

	for (const result of results ?? []) {
		const label = result.status === 'Success' ? '✓' : result.status === 'Error' ? '✗' : '~';
		console.log(`${label} ${result.direction} ${result.migrationName}`);
	}

	if (error) {
		throw error instanceof Error ? error : new Error(`Migration failed: ${String(error)}`);
	}
}
