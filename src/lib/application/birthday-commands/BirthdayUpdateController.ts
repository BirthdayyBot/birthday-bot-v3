import { LanguageKeys } from '#lib/i18n/languageKeys';
import { buildBirthday, formatBirthdayDate, formatTimeUntilNextBirthday, getGuildLocaleAndTimezone } from '#lib/utilities/birthday-command';
import type { ControllerPrepareResult, ControllerSuccess } from '#lib/application/types';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

type UpdatePrepareWarningCode = 'invalid-date' | 'not-found';
type UpdateApplyKey =
	| typeof LanguageKeys.Commands.Birthday.SubcommandUpdateResponseUpdatedSelf
	| typeof LanguageKeys.Commands.Birthday.SubcommandUpdateResponseUpdatedOther;

interface UpdateApplyArgs {
	date: string;
	timeUntil: string;
	userId?: string;
}

export type BirthdayUpdatePrepareResult = ControllerPrepareResult<UpdatePrepareWarningCode, { birthday: string }>;
export type BirthdayUpdateApplyResult = ControllerSuccess<UpdateApplyKey, UpdateApplyArgs>;

export class BirthdayUpdateController {
	public constructor(
		private readonly birthdayRepository: IBirthdayRepository,
		private readonly guildRepository: IGuildRepository
	) {}

	public async prepare(input: {
		guildId: string;
		targetId: string;
		month: number;
		day: number;
		year?: number | null;
	}): Promise<BirthdayUpdatePrepareResult> {
		const birthday = buildBirthday(input.month, input.day, input.year ?? null);
		if (!birthday) {
			return { status: 'warning', code: 'invalid-date' };
		}

		const existing = await this.birthdayRepository.findByUserAndGuild(input.targetId, input.guildId);
		if (!existing || !existing.isActive()) {
			return { status: 'warning', code: 'not-found' };
		}

		return { status: 'ready', data: { birthday } };
	}

	public async apply(input: { guildId: string; targetId: string; birthday: string; isSelf: boolean }): Promise<BirthdayUpdateApplyResult> {
		await this.birthdayRepository.upsert({ userId: input.targetId, guildId: input.guildId, birthday: input.birthday });

		const { language, timeZone } = await getGuildLocaleAndTimezone(this.guildRepository, input.guildId);
		const date = formatBirthdayDate(input.birthday, language);
		const timeUntil = formatTimeUntilNextBirthday(input.birthday, timeZone);

		if (input.isSelf) {
			return {
				status: 'success',
				key: LanguageKeys.Commands.Birthday.SubcommandUpdateResponseUpdatedSelf,
				args: { date, timeUntil }
			};
		}

		return {
			status: 'success',
			key: LanguageKeys.Commands.Birthday.SubcommandUpdateResponseUpdatedOther,
			args: { date, timeUntil, userId: input.targetId }
		};
	}
}
