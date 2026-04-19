import { ApplyOptions } from '@sapphire/decorators';
import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ route: '/birthday/:guildId', methods: ['GET'] })
export class BirthdayListRoute extends Route {
	public override async run(request: ApiRequest, response: ApiResponse): Promise<void> {
		const { guildId } = request.params;
		const birthdays = await this.container.birthday.findActiveByGuildId(guildId);
		response.ok({ entries: birthdays.map((b) => ({ userId: b.userId, birthday: b.birthday })) });
	}
}
