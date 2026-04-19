import { Nullish } from '@sapphire/utilities/types';
import type { AnalyticsData } from '#lib/structures/AnalyticsData';
import type { Database } from '#lib/database/Database';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';
import type { IBlacklistRepository } from '#lib/domain/blacklist/IBlacklistRepository';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';
import type { IPremiumRepository } from '#lib/domain/premium/IPremiumRepository';
import type { IUserRepository } from '#lib/domain/user/IUserRepository';
import type { ISubscriptionHistoryRepository } from '#lib/domain/subscription/ISubscriptionHistoryRepository';
import type { ArrayString, BooleanString, IntegerString } from '@skyra/env-utilities';
import type { Kysely } from 'kysely';
import { WebhookClient } from 'discord.js';
import type { API } from '@discordjs/core/http-only';

declare module '@sapphire/pieces' {
	interface Container {
		api?: API;
		/** The InfluxDB Analytics controller. */
		analytics: AnalyticsData | Nullish;
		/** The webhook to use for the error event. */
		webhookError: WebhookClient | Nullish;
		database: Kysely<Database>;
		birthday: IBirthdayRepository;
		blacklist: IBlacklistRepository;
		guild: IGuildRepository;
		premium: IPremiumRepository;
		user: IUserRepository;
		subscriptionHistory: ISubscriptionHistoryRepository;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
		ManageGuild: never;
		UserIsPatreon: never;
	}

	interface ScheduledTasks {
		postStats: never;
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		birthdayAnnouncements: never;
		birthdayRoleReset: {
			guildId: string;
			userId: string;
			roleId: string;
			dateKey: string;
		};
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		CLIENT_ID: string;
		CLIENT_VERSION: string;
		CLIENT_PRESENCE_NAME: string;
		CLIENT_PRESENCE_TYPE: string;

		API_ENABLED: BooleanString;
		API_ORIGIN: string;
		API_PORT: IntegerString;
		API_PREFIX: string;

		OAUTH_COOKIE: string;
		OAUTH_DOMAIN_OVERWRITE: string;
		OAUTH_REDIRECT_URI: string;
		OAUTH_SCOPE: ArrayString;
		OAUTH_SECRET: string;

		COMMAND_GUILD_IDS: ArrayString;

		REDIS_PORT: IntegerString;
		REDIS_PASSWORD: string;
		REDIS_HOST: string;
		REDIS_CACHE_DB: IntegerString;
		REDIS_TASK_DB: IntegerString;

		WEBHOOK_ERROR_ID: string;
		WEBHOOK_ERROR_TOKEN: string;

		INFLUX_ENABLED: BooleanString;
		INFLUX_URL: string;
		INFLUX_TOKEN: string;
		INFLUX_ORG: string;
		INFLUX_ORG_ANALYTICS_BUCKET: string;

		DB_URL: string;
		DB_AUTO_MIGRATE: BooleanString;

		PATREON_WEBHOOK_SECRET: string;
		PATREON_CREATOR_ACCESS_TOKEN: string;
	}
}
