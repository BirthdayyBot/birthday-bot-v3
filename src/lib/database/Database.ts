import type { BirthdayTable, BlacklistTable, GuildTable, PremiumTable, SubscriptionHistoryTable, TiersTable, UserTable } from './types.js';

export interface Database {
	birthday: BirthdayTable;
	guild: GuildTable;
	user: UserTable;
	blacklist: BlacklistTable;
	premium: PremiumTable;
	tiers: TiersTable;
	subscription_history: SubscriptionHistoryTable;
}
