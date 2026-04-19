import type { Kysely } from 'kysely';
import type { IUserRepository } from '#lib/domain/user/IUserRepository';
import type { User } from '#lib/domain/user/User';
import type { Database } from '#lib/database/Database';
import { toUserEntity } from '#lib/infrastructure/mappers/UserMapper';

export class KyselyUserRepository implements IUserRepository {
	readonly #db: Kysely<Database>;

	public constructor(db: Kysely<Database>) {
		this.#db = db;
	}

	public async findById(userId: string): Promise<User | null> {
		const row = await this.#db.selectFrom('user').selectAll().where('user_id', '=', userId).executeTakeFirst();
		return row ? toUserEntity(row) : null;
	}

	public async upsert(data: { userId: string; username?: string | null; discriminator?: string | null; lastUpdated: Date }): Promise<void> {
		await this.#db
			.insertInto('user')
			.values({
				user_id: data.userId,
				username: data.username ?? null,
				discriminator: data.discriminator ?? null,
				last_updated: data.lastUpdated
			})
			.onDuplicateKeyUpdate({ username: data.username ?? null, discriminator: data.discriminator ?? null, last_updated: data.lastUpdated })
			.execute();
	}

	public async setPremium(userId: string, premium: boolean): Promise<void> {
		await this.#db.updateTable('user').set({ premium }).where('user_id', '=', userId).execute();
	}

	public async setPatreonSlots(userId: string, maxSlots: number): Promise<void> {
		await this.#db.updateTable('user').set({ patreon_max_slots: maxSlots }).where('user_id', '=', userId).execute();
	}
}
