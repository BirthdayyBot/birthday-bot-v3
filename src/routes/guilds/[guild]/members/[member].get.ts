import { flattenMember } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { HttpCodes, Route } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';

export class UserRoute extends Route {
	@authenticated()
	@ratelimit(Time.Second * 5, 2, true)
	public async run(request: Route.Request, response: Route.Response) {
		const guildId = request.params.guild;

		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const memberAuthor = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!memberAuthor) return response.error(HttpCodes.BadRequest);
		if (!(await canManage(guild, memberAuthor))) return response.error(HttpCodes.Forbidden);

		const memberId = request.params.member;
		const member = await guild.members.fetch(memberId).catch(() => null);
		return member ? response.json(flattenMember(member)) : response.error(HttpCodes.NotFound);
	}
}
