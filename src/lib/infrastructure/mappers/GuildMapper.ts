import type { Selectable, Updateable } from 'kysely';
import { Guild } from '#lib/domain/guild/Guild';
import type { GuildUpdateData } from '#lib/domain/guild/IGuildRepository';
import type { GuildTable } from '#lib/database/types';

export function toGuildEntity(row: Selectable<GuildTable>): Guild {
	return new Guild({
		guildId: row.guild_id,
		inviter: row.inviter,
		announcementChannel: row.announcement_channel,
		announcementMessage: row.announcement_message,
		overviewChannel: row.overview_channel,
		overviewMessage: row.overview_message,
		overviewSort: row.overview_sort,
		birthdayRole: row.birthday_role,
		birthdayPingRole: row.birthday_ping_role,
		logChannel: row.log_channel,
		timezone: row.timezone,
		premium: row.premium,
		language: row.language,
		lastUpdated: row.last_updated,
		disabled: row.disabled
	});
}

export function toGuildRow(data: GuildUpdateData): Updateable<GuildTable> {
	const row: Updateable<GuildTable> = {};
	if (data.inviter !== undefined) row.inviter = data.inviter;
	if (data.announcementChannel !== undefined) row.announcement_channel = data.announcementChannel;
	if (data.announcementMessage !== undefined) row.announcement_message = data.announcementMessage;
	if (data.overviewChannel !== undefined) row.overview_channel = data.overviewChannel;
	if (data.overviewMessage !== undefined) row.overview_message = data.overviewMessage;
	if (data.overviewSort !== undefined) row.overview_sort = data.overviewSort;
	if (data.birthdayRole !== undefined) row.birthday_role = data.birthdayRole;
	if (data.birthdayPingRole !== undefined) row.birthday_ping_role = data.birthdayPingRole;
	if (data.logChannel !== undefined) row.log_channel = data.logChannel;
	if (data.timezone !== undefined) row.timezone = data.timezone;
	if (data.premium !== undefined) row.premium = data.premium;
	if (data.language !== undefined) row.language = data.language;
	if (data.lastUpdated !== undefined) row.last_updated = data.lastUpdated;
	if (data.disabled !== undefined) row.disabled = data.disabled;
	return row;
}
