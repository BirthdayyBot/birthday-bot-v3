import type { BirthdayTable, BlacklistTable, GuildTable, PremiumTable, TiersTable, UserTable } from './types.js';

export interface Database {
	birthday: BirthdayTable;
	guild: GuildTable;
	user: UserTable;
	blacklist: BlacklistTable;
	premium: PremiumTable;
	tiers: TiersTable;
}
