import { ApplyOptions } from '@sapphire/decorators';
import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { BirthdayDeleteController } from '#lib/application/birthday-commands/BirthdayDeleteController';
import { BirthdayRegisterController } from '#lib/application/birthday-commands/BirthdayRegisterController';
import { BirthdayUpdateController } from '#lib/application/birthday-commands/BirthdayUpdateController';

@ApplyOptions<Route.Options>({ route: '/birthday/:guildId/:userId', methods: ['GET', 'POST', 'PATCH', 'DELETE'] })
export class BirthdayUserRoute extends Route {
	public override async run(request: ApiRequest, response: ApiResponse): Promise<void> {
		switch (request.method?.toUpperCase()) {
			case 'GET':
				return this.handleGet(request, response);
			case 'POST':
				return this.handlePost(request, response);
			case 'PATCH':
				return this.handlePatch(request, response);
			case 'DELETE':
				return this.handleDelete(request, response);
			default:
				response.methodNotAllowed();
		}
	}

	private async handleGet(request: ApiRequest, response: ApiResponse): Promise<void> {
		const { guildId, userId } = request.params;
		const birthday = await this.container.birthday.findByUserAndGuild(userId, guildId);
		if (!birthday || !birthday.isActive()) return response.notFound();
		response.ok({ userId: birthday.userId, guildId: birthday.guildId, birthday: birthday.birthday });
	}

	private async handlePost(request: ApiRequest, response: ApiResponse): Promise<void> {
		const { guildId, userId } = request.params;
		const body = (await request.readBodyJson()) as { month?: unknown; day?: unknown; year?: unknown } | null;
		const month = Number(body?.month);
		const day = Number(body?.day);
		const year = body?.year === null ? null : Number(body?.year);

		if (!Number.isInteger(month) || !Number.isInteger(day)) return response.badRequest();

		const controller = new BirthdayRegisterController(this.container.birthday, this.container.guild);
		const result = await controller.execute({ guildId, targetId: userId, isSelf: false, month, day, year });

		if (result.status === 'warning') {
			if (result.code === 'invalid-date') return response.badRequest({ code: result.code });
			return response.conflict({ code: result.code });
		}

		response.created({ userId, guildId });
	}

	private async handlePatch(request: ApiRequest, response: ApiResponse): Promise<void> {
		const { guildId, userId } = request.params;
		const body = (await request.readBodyJson()) as { month?: unknown; day?: unknown; year?: unknown } | null;
		const month = Number(body?.month);
		const day = Number(body?.day);
		const year = body?.year === null ? null : Number(body?.year);

		if (!Number.isInteger(month) || !Number.isInteger(day)) return response.badRequest();

		const controller = new BirthdayUpdateController(this.container.birthday, this.container.guild);
		const prep = await controller.prepare({ guildId, targetId: userId, month, day, year });

		if (prep.status === 'warning') {
			if (prep.code === 'invalid-date') return response.badRequest({ code: prep.code });
			return response.notFound({ code: prep.code });
		}

		await controller.apply({ guildId, targetId: userId, birthday: prep.data!.birthday, isSelf: false });
		response.ok({ userId, guildId });
	}

	private async handleDelete(request: ApiRequest, response: ApiResponse): Promise<void> {
		const { guildId, userId } = request.params;
		const controller = new BirthdayDeleteController(this.container.birthday);
		const prep = await controller.prepare({ guildId, targetId: userId });

		if (prep.status === 'warning') return response.notFound({ code: prep.code });

		await controller.apply({ guildId, targetId: userId, isSelf: false });
		response.noContent();
	}
}
