import type { Kysely } from 'kysely';
import type { IPremiumRepository } from '#lib/domain/premium/IPremiumRepository';
import type { PremiumGrant } from '#lib/domain/premium/PremiumGrant';
import type { Database } from '#lib/database/Database';
import { toPremiumGrantEntity } from '#lib/infrastructure/mappers/PremiumMapper';

export class KyselyPremiumRepository implements IPremiumRepository {
	readonly #db: Kysely<Database>;

	public constructor(db: Kysely<Database>) {
		this.#db = db;
	}

	public async findByUserId(userId: string): Promise<PremiumGrant[]> {
		const rows = await this.#db.selectFrom('premium').selectAll().where('user_id', '=', userId).execute();
		return rows.map(toPremiumGrantEntity);
	}

	public async findByGuildId(guildId: string): Promise<PremiumGrant | null> {
		const row = await this.#db.selectFrom('premium').selectAll().where('guild_id', '=', guildId).executeTakeFirst();
		return row ? toPremiumGrantEntity(row) : null;
	}

	public async add(data: { userId: string; guildId?: string | null }): Promise<void> {
		await this.#db
			.insertInto('premium')
			.values({ user_id: data.userId, guild_id: data.guildId ?? null })
			.execute();
	}

	public async removeByUserId(userId: string): Promise<void> {
		await this.#db.deleteFrom('premium').where('user_id', '=', userId).execute();
	}

	public async removeByGuildId(guildId: string): Promise<void> {
		await this.#db.deleteFrom('premium').where('guild_id', '=', guildId).execute();
	}

	public async removeUserGrantByUserId(userId: string): Promise<void> {
		await this.#db.deleteFrom('premium').where('user_id', '=', userId).where('guild_id', 'is', null).execute();
	}

	public async countGuildGrantsByUserId(userId: string): Promise<number> {
		const result = await this.#db
			.selectFrom('premium')
			.select((eb) => eb.fn.countAll<number>().as('count'))
			.where('user_id', '=', userId)
			.where('guild_id', 'is not', null)
			.executeTakeFirstOrThrow();
		return Number(result.count);
	}

	public async findByUserAndGuild(userId: string, guildId: string): Promise<PremiumGrant | null> {
		const row = await this.#db
			.selectFrom('premium')
			.selectAll()
			.where('user_id', '=', userId)
			.where('guild_id', '=', guildId)
			.executeTakeFirst();
		return row ? toPremiumGrantEntity(row) : null;
	}

	public async removeByUserAndGuild(userId: string, guildId: string): Promise<void> {
		await this.#db.deleteFrom('premium').where('user_id', '=', userId).where('guild_id', '=', guildId).execute();
	}
}
