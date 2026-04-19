import { LanguageKeys } from '#lib/i18n/languageKeys';
import { buildBirthday, formatBirthdayDate, formatTimeUntilNextBirthday, getGuildLocaleAndTimezone } from '#lib/utilities/birthday-command';
import type { ControllerResult } from '#lib/application/types';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

type RegisterWarningCode = 'invalid-date' | 'already-exists';
type RegisterSuccessKey =
	| typeof LanguageKeys.Commands.Birthday.SubcommandRegisterResponseRegisteredSelf
	| typeof LanguageKeys.Commands.Birthday.SubcommandRegisterResponseRegisteredOther;

interface RegisterSuccessArgs {
	date: string;
	timeUntil: string;
	userId?: string;
}

export type BirthdayRegisterResult = ControllerResult<RegisterSuccessKey, RegisterWarningCode, RegisterSuccessArgs>;

export class BirthdayRegisterController {
	public constructor(
		private readonly birthdayRepository: IBirthdayRepository,
		private readonly guildRepository: IGuildRepository
	) {}

	public async execute(input: {
		guildId: string;
		targetId: string;
		isSelf: boolean;
		month: number;
		day: number;
		year?: number | null;
	}): Promise<BirthdayRegisterResult> {
		const birthday = buildBirthday(input.month, input.day, input.year ?? null);
		if (!birthday) {
			return { status: 'warning', code: 'invalid-date' };
		}

		const existing = await this.birthdayRepository.findByUserAndGuild(input.targetId, input.guildId);
		if (existing?.isActive()) {
			return { status: 'warning', code: 'already-exists' };
		}

		await this.birthdayRepository.upsert({ userId: input.targetId, guildId: input.guildId, birthday });

		const { language, timeZone } = await getGuildLocaleAndTimezone(this.guildRepository, input.guildId);
		const date = formatBirthdayDate(birthday, language);
		const timeUntil = formatTimeUntilNextBirthday(birthday, timeZone);

		if (input.isSelf) {
			return {
				status: 'success',
				key: LanguageKeys.Commands.Birthday.SubcommandRegisterResponseRegisteredSelf,
				args: { date, timeUntil }
			};
		}

		return {
			status: 'success',
			key: LanguageKeys.Commands.Birthday.SubcommandRegisterResponseRegisteredOther,
			args: { date, timeUntil, userId: input.targetId }
		};
	}
}
