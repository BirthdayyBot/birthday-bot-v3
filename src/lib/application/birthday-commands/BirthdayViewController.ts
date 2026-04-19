import { LanguageKeys } from '#lib/i18n/languageKeys';
import { formatBirthdayDate, formatTimeUntilNextBirthday, getAgeAtNextBirthday, getGuildLocaleAndTimezone } from '#lib/utilities/birthday-command';
import type { ControllerResult } from '#lib/application/types';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

type ViewSuccessKey =
	| typeof LanguageKeys.Commands.Birthday.SubcommandViewResponseDateWithAgeSelf
	| typeof LanguageKeys.Commands.Birthday.SubcommandViewResponseDateWithAgeOther
	| typeof LanguageKeys.Commands.Birthday.SubcommandViewResponseDateSelf
	| typeof LanguageKeys.Commands.Birthday.SubcommandViewResponseDateOther;
interface ViewSuccessArgs {
	date: string;
	timeUntil: string;
	age?: number;
	userId?: string;
}

export type BirthdayViewResult = ControllerResult<ViewSuccessKey, 'not-found', ViewSuccessArgs>;

export class BirthdayViewController {
	public constructor(
		private readonly birthdayRepository: IBirthdayRepository,
		private readonly guildRepository: IGuildRepository
	) {}

	public async execute(input: { guildId: string; targetId: string; isSelf: boolean }): Promise<BirthdayViewResult> {
		const existing = await this.birthdayRepository.findByUserAndGuild(input.targetId, input.guildId);
		if (!existing || !existing.isActive()) {
			return { status: 'warning', code: 'not-found' };
		}

		const { language, timeZone } = await getGuildLocaleAndTimezone(this.guildRepository, input.guildId);
		const date = formatBirthdayDate(existing.birthday, language);
		const timeUntil = formatTimeUntilNextBirthday(existing.birthday, timeZone);
		const age = getAgeAtNextBirthday(existing.birthday, timeZone);

		if (age !== null && input.isSelf) {
			return {
				status: 'success',
				key: LanguageKeys.Commands.Birthday.SubcommandViewResponseDateWithAgeSelf,
				args: { date, age, timeUntil }
			};
		}

		if (age !== null) {
			return {
				status: 'success',
				key: LanguageKeys.Commands.Birthday.SubcommandViewResponseDateWithAgeOther,
				args: { date, age, timeUntil, userId: input.targetId }
			};
		}

		if (input.isSelf) {
			return {
				status: 'success',
				key: LanguageKeys.Commands.Birthday.SubcommandViewResponseDateSelf,
				args: { date, timeUntil }
			};
		}

		return {
			status: 'success',
			key: LanguageKeys.Commands.Birthday.SubcommandViewResponseDateOther,
			args: { date, timeUntil, userId: input.targetId }
		};
	}
}
