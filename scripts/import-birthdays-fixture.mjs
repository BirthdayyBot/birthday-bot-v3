import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

function getArg(flag) {
	const index = process.argv.indexOf(flag);
	if (index === -1) return null;
	return process.argv[index + 1] ?? null;
}

function hasFlag(flag) {
	return process.argv.includes(flag);
}

function printUsage() {
	console.log(`Usage:
  node --env-file=src/.env scripts/import-birthdays-fixture.mjs [options]

Options:
  --file <path>              CSV path (default: tests/fixtures/birthdays-guild-1122813191546740796.csv)
	--db-url <url>             Database URL override (takes priority over env)
  --force-guild-id <id>      Override guild_id for all imported rows
  --truncate-guild <id>      Delete existing birthday rows for that guild before import
  --batch-size <number>      Rows per INSERT batch (default: 500)
  --help                     Show this help
`);
}

function parseDbUrl(raw) {
	if (!raw) {
		throw new Error('Missing database URL. Provide --db-url, or set DB_URL / DATABASE_URL, or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.');
	}
	const url = new URL(raw);
	return {
		host: url.hostname,
		port: Number(url.port || 3306),
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		database: url.pathname.replace(/^\//, ''),
		charset: 'utf8mb4'
	};
}

function parseDbConfigFromParts() {
	const host = process.env.DB_HOST;
	const user = process.env.DB_USER;
	const password = process.env.DB_PASSWORD;
	const database = process.env.DB_NAME;
	const portRaw = process.env.DB_PORT;

	if (!host || !user || !database) return null;

	const port = portRaw ? Number(portRaw) : 3306;
	if (!Number.isInteger(port) || port <= 0) {
		throw new Error(`Invalid DB_PORT value: ${portRaw}`);
	}

	return {
		host,
		port,
		user,
		password: password ?? '',
		database,
		charset: 'utf8mb4'
	};
}

function parseCsvLine(line, lineNumber) {
	const parts = line.split(',');
	if (parts.length !== 4) {
		throw new Error(`Invalid CSV format at line ${lineNumber}: expected 4 columns, got ${parts.length}`);
	}

	const [user_id, guild_id, birthday, disabledRaw] = parts.map((value) => value.trim());
	if (!user_id || !guild_id || !birthday) {
		throw new Error(`Invalid CSV format at line ${lineNumber}: empty required value`);
	}

	const disabled = Number(disabledRaw);
	if (!Number.isInteger(disabled) || (disabled !== 0 && disabled !== 1)) {
		throw new Error(`Invalid disabled value at line ${lineNumber}: ${disabledRaw}`);
	}

	return { user_id, guild_id, birthday, disabled };
}

async function main() {
	if (hasFlag('--help')) {
		printUsage();
		return;
	}

	const csvPath = getArg('--file') ?? 'tests/fixtures/birthdays-guild-1122813191546740796.csv';
	const dbUrlArg = getArg('--db-url');
	const forceGuildId = getArg('--force-guild-id');
	const truncateGuildId = getArg('--truncate-guild');
	const batchSizeValue = getArg('--batch-size');
	const batchSize = batchSizeValue ? Number(batchSizeValue) : 500;

	if (!Number.isInteger(batchSize) || batchSize <= 0) {
		throw new Error(`Invalid --batch-size value: ${batchSizeValue}`);
	}

	const raw = await fs.readFile(csvPath, 'utf8');
	const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
	if (lines.length < 2) throw new Error('CSV has no data rows');

	const header = lines[0].trim();
	if (header !== 'user_id,guild_id,birthday,disabled') {
		throw new Error(`Unexpected CSV header: ${header}`);
	}

	const rows = lines.slice(1).map((line, idx) => {
		const row = parseCsvLine(line, idx + 2);
		if (forceGuildId) row.guild_id = forceGuildId;
		return row;
	});

	const dbUrl = dbUrlArg ?? process.env.DB_URL ?? process.env.DATABASE_URL;
	const dbConfig = dbUrl ? parseDbUrl(dbUrl) : parseDbConfigFromParts();
	if (!dbConfig) {
		throw new Error('Missing DB config. Set DB_URL / DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.');
	}

	const db = await mysql.createConnection(dbConfig);

	try {
		if (truncateGuildId) {
			const [result] = await db.execute('DELETE FROM birthday WHERE guild_id = ?', [truncateGuildId]);
			console.log(`Deleted existing rows for guild ${truncateGuildId}: ${result.affectedRows}`);
		}

		let imported = 0;
		for (let i = 0; i < rows.length; i += batchSize) {
			const batch = rows.slice(i, i + batchSize);
			const placeholders = batch.map(() => '(?,?,?,?)').join(',');
			const values = batch.flatMap((r) => [r.user_id, r.guild_id, r.birthday, r.disabled]);

			const query = `
				INSERT INTO birthday (user_id, guild_id, birthday, disabled)
				VALUES ${placeholders}
				ON DUPLICATE KEY UPDATE
					birthday = VALUES(birthday),
					disabled = VALUES(disabled)
			`;

			await db.execute(query, values);
			imported += batch.length;
		}

		console.log(`Imported/updated rows: ${imported}`);
		const targetGuild = forceGuildId ?? truncateGuildId ?? rows[0].guild_id;
		const [countRows] = await db.execute('SELECT COUNT(*) AS count FROM birthday WHERE guild_id = ?', [targetGuild]);
		console.log(`Rows currently in guild ${targetGuild}: ${countRows[0].count}`);
	} finally {
		await db.end();
	}
}

main().catch((error) => {
	console.error('[IMPORT] Failed:', error instanceof Error ? error.message : String(error));
	process.exit(1);
});
