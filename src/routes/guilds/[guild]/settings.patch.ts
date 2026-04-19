import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { GuildUpdateData } from '#lib/domain/guild/IGuildRepository';
import { HttpCodes, Route } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';

const ALLOWED_KEYS: ReadonlyArray<keyof GuildUpdateData> = [
	'timezone',
	'language',
	'announcementChannel',
	'announcementMessage',
	'overviewChannel',
	'overviewSort',
	'birthdayRole',
	'birthdayPingRole',
	'logChannel'
];

export class UserRoute extends Route {
	@authenticated()
	@ratelimit(Time.Second * 5, 2, true)
	public async run(request: Route.Request, response: Route.Response) {
		const guildId = request.params.guild;

		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.error(HttpCodes.BadRequest);

		if (!(await canManage(guild, member))) return response.error(HttpCodes.Forbidden);

		const body = (await request.readBodyJson()) as Record<string, unknown> | null;
		if (!body) return response.error(HttpCodes.BadRequest);

		const data: GuildUpdateData = {};
		for (const key of ALLOWED_KEYS) {
			if (Object.hasOwn(body, key)) {
				(data as Record<string, unknown>)[key] = body[key];
			}
		}

		if (Object.keys(data).length === 0) return response.error(HttpCodes.BadRequest);

		await saveGuildConfig(this.container.guild, guildId, data, '');
		return response.json({ guildId, updated: Object.keys(data) });
	}
}
