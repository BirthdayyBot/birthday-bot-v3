import { ratelimit } from '#lib/api/utils';
import { Route } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';

export class UserRoute extends Route {
	@ratelimit(Time.Second * 2, 2)
	public run(_request: Route.Request, response: Route.Response) {
		return response.json([...this.container.i18n.languages.keys()]);
	}
}
