import { ratelimit } from '#lib/api/utils';
import { Route } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';

export class UserRoute extends Route {
	@ratelimit(Time.Second * 2, 2)
	public run(_request: Route.Request, response: Route.Response) {
		const commands = [...this.container.stores.get('commands').values()].map((command) => ({
			name: command.name,
			description: command.description,
			category: command.category,
			enabled: command.enabled
		}));

		return response.json(commands);
	}
}
