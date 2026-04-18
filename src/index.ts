import '#lib/setup/all';
import { migrateToLatest } from '#lib/database/migrate';
import { CLIENT_OPTIONS } from '#root/config';
import { container, SapphireClient } from '@sapphire/framework';
import { green, red } from 'colorette';
import { sql } from 'kysely';

const shouldAutoMigrate = process.env.DB_AUTO_MIGRATE !== 'false';

try {
	if (shouldAutoMigrate) {
		await migrateToLatest();
	}
	await sql`SELECT 1`.execute(container.database);
} catch (error) {
	console.error(`${red('DB     ')} - Failed to migrate or connect to the database. Aborting startup.`);
	console.error(error);
	await container.database.destroy();
	process.exit(1);
}

const client = new SapphireClient(CLIENT_OPTIONS);

try {
	await client.login();
	client.logger.info(`${green('WS     ')} - Successfully logged in.`);
} catch (error) {
	client.logger.error(error);
	await client.destroy();
	process.exit(1);
}