import type { Kysely } from 'kysely';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';
import type { Birthday } from '#lib/domain/birthday/Birthday';
import type { Database } from '#lib/database/Database';
import { toBirthdayEntity } from '#lib/infrastructure/mappers/BirthdayMapper';

export class KyselyBirthdayRepository implements IBirthdayRepository {
	readonly #db: Kysely<Database>;

	public constructor(db: Kysely<Database>) {
		this.#db = db;
	}

	public async findByUserId(userId: string): Promise<Birthday[]> {
		const rows = await this.#db.selectFrom('birthday').selectAll().where('user_id', '=', userId).execute();
		return rows.map(toBirthdayEntity);
	}

	public async findByGuildId(guildId: string): Promise<Birthday[]> {
		const rows = await this.#db.selectFrom('birthday').selectAll().where('guild_id', '=', guildId).execute();
		return rows.map(toBirthdayEntity);
	}

	public async findByUserAndGuild(userId: string, guildId: string): Promise<Birthday | null> {
		const row = await this.#db
			.selectFrom('birthday')
			.selectAll()
			.where('user_id', '=', userId)
			.where('guild_id', '=', guildId)
			.executeTakeFirst();
		return row ? toBirthdayEntity(row) : null;
	}

	public async findActiveByGuildId(guildId: string): Promise<Birthday[]> {
		const rows = await this.#db
			.selectFrom('birthday')
			.selectAll()
			.where('guild_id', '=', guildId)
			.where('disabled', '=', false)
			.execute();
		return rows.map(toBirthdayEntity);
	}

	public async upsert(data: { userId: string; guildId: string; birthday: string }): Promise<void> {
		await this.#db
			.insertInto('birthday')
			.values({ user_id: data.userId, guild_id: data.guildId, birthday: data.birthday })
			.onDuplicateKeyUpdate({ birthday: data.birthday, disabled: false })
			.execute();
	}

	public async setDisabled(userId: string, guildId: string, disabled: boolean): Promise<void> {
		await this.#db
			.updateTable('birthday')
			.set({ disabled })
			.where('user_id', '=', userId)
			.where('guild_id', '=', guildId)
			.execute();
	}

	public async delete(userId: string, guildId: string): Promise<void> {
		await this.#db.deleteFrom('birthday').where('user_id', '=', userId).where('guild_id', '=', guildId).execute();
	}
}
