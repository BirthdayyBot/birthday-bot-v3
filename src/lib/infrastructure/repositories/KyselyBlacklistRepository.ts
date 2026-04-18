import type { Kysely } from 'kysely';
import type { IBlacklistRepository } from '#lib/domain/blacklist/IBlacklistRepository';
import type { BlacklistEntry } from '#lib/domain/blacklist/BlacklistEntry';
import type { Database } from '#lib/database/Database';
import { toBlacklistEntryEntity } from '#lib/infrastructure/mappers/BlacklistMapper';

export class KyselyBlacklistRepository implements IBlacklistRepository {
	readonly #db: Kysely<Database>;

	public constructor(db: Kysely<Database>) {
		this.#db = db;
	}

	public async findActiveByGuildId(guildId: string): Promise<BlacklistEntry[]> {
		const rows = await this.#db
			.selectFrom('blacklist')
			.selectAll()
			.where('guild_id', '=', guildId)
			.where('disabled', '=', false)
			.execute();
		return rows.map(toBlacklistEntryEntity);
	}

	public async findActiveByUserAndGuild(userId: string, guildId: string): Promise<BlacklistEntry | null> {
		const row = await this.#db
			.selectFrom('blacklist')
			.selectAll()
			.where('user_id', '=', userId)
			.where('guild_id', '=', guildId)
			.where('disabled', '=', false)
			.executeTakeFirst();
		return row ? toBlacklistEntryEntity(row) : null;
	}

	public async add(data: { guildId: string; userId: string; addedAt: Date }): Promise<void> {
		await this.#db
			.insertInto('blacklist')
			.values({ guild_id: data.guildId, user_id: data.userId, added_at: data.addedAt })
			.execute();
	}

	public async setDisabled(userId: string, guildId: string, disabled: boolean): Promise<void> {
		await this.#db
			.updateTable('blacklist')
			.set({ disabled })
			.where('user_id', '=', userId)
			.where('guild_id', '=', guildId)
			.execute();
	}
}
