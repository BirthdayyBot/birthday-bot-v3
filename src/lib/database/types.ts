import type { Generated } from 'kysely';

export interface BirthdayTable {
	id: Generated<bigint>;
	user_id: string;
	guild_id: string;
	birthday: string;
	disabled: Generated<boolean>;
}

export interface GuildTable {
	guild_id: string;
	inviter: string | null;
	announcement_channel: string | null;
	announcement_message: string;
	overview_channel: string | null;
	overview_message: string | null;
	overview_sort: Generated<string>;
	birthday_role: string | null;
	birthday_ping_role: string | null;
	log_channel: string | null;
	timezone: Generated<string>;
	premium: Generated<boolean>;
	language: Generated<string>;
	last_updated: Date | null;
	disabled: Generated<boolean>;
}

export interface UserTable {
	user_id: string;
	username: string | null;
	discriminator: string | null;
	premium: Generated<boolean>;
	patreon_max_slots: Generated<number>;
	last_updated: Date;
}

export interface BlacklistTable {
	id: Generated<bigint>;
	guild_id: string;
	user_id: string;
	added_at: Date;
	disabled: Generated<boolean>;
}

export interface PremiumTable {
	id: Generated<number>;
	user_id: string;
	guild_id: string | null;
	tier: Generated<boolean>;
}

export interface TiersTable {
	id: Generated<number>;
	name: string | null;
	last_updated: Date;
}

export interface SubscriptionHistoryTable {
	id: Generated<number>;
	user_id: string;
	tier: string;
	slots: number;
	source: string;
	started_at: Generated<Date>;
	ended_at: Date | null;
}
