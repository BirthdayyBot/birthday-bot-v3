import type { Kysely, Insertable } from 'kysely';
import type { IGuildRepository, GuildUpdateData } from '#lib/domain/guild/IGuildRepository';
import type { Guild } from '#lib/domain/guild/Guild';
import type { Database } from '#lib/database/Database';
import type { GuildTable } from '#lib/database/types';
import { toGuildEntity, toGuildRow } from '#lib/infrastructure/mappers/GuildMapper';

export class KyselyGuildRepository implements IGuildRepository {
	readonly #db: Kysely<Database>;

	public constructor(db: Kysely<Database>) {
		this.#db = db;
	}

	public async findById(guildId: string): Promise<Guild | null> {
		const row = await this.#db.selectFrom('guild').selectAll().where('guild_id', '=', guildId).executeTakeFirst();
		return row ? toGuildEntity(row) : null;
	}

	public async upsert(data: Guild): Promise<void> {
		const row: Insertable<GuildTable> = {
			guild_id: data.guildId,
			inviter: data.inviter,
			announcement_channel: data.announcementChannel,
			announcement_message: data.announcementMessage,
			overview_channel: data.overviewChannel,
			overview_message: data.overviewMessage,
			overview_sort: data.overviewSort,
			birthday_role: data.birthdayRole,
			birthday_ping_role: data.birthdayPingRole,
			log_channel: data.logChannel,
			timezone: data.timezone,
			announcement_hour: data.announcementHour,
			premium: data.premium,
			language: data.language,
			last_updated: data.lastUpdated,
			disabled: data.disabled
		};
		await this.#db.insertInto('guild').values(row).onDuplicateKeyUpdate(toGuildRow(data)).execute();
	}

	public async update(guildId: string, data: GuildUpdateData): Promise<void> {
		await this.#db.updateTable('guild').set(toGuildRow(data)).where('guild_id', '=', guildId).execute();
	}

	public async setDisabled(guildId: string, disabled: boolean): Promise<void> {
		await this.#db.updateTable('guild').set({ disabled }).where('guild_id', '=', guildId).execute();
	}

	public async delete(guildId: string): Promise<void> {
		await this.#db.deleteFrom('guild').where('guild_id', '=', guildId).execute();
	}
}
