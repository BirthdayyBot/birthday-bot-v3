import {
	formatBirthdayDateWithYear,
	getAgeAtNextBirthday,
	getDaysUntilNextBirthday,
	getGuildLocaleAndTimezone,
	normalizeBirthdaySortMode,
	sortBirthdaysForDisplay,
	type BirthdaySortMode
} from '#lib/utilities/birthday-command';
import type { ControllerData } from '#lib/application/types';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export interface BirthdayListEntry {
	userId: string;
	date: string;
	daysUntil: number | null;
	age: number | null;
}

export interface BirthdayListData {
	sortMode: BirthdaySortMode;
	language: string;
	timeZone: string;
	entries: BirthdayListEntry[];
}

export type BirthdayListResult = ControllerData<BirthdayListData>;

export class BirthdayListController {
	public constructor(
		private readonly birthdayRepository: IBirthdayRepository,
		private readonly guildRepository: IGuildRepository
	) {}

	public async execute(input: { guildId: string; sortMode: string | null }): Promise<BirthdayListResult> {
		const sortMode = normalizeBirthdaySortMode(input.sortMode);
		const birthdays = await this.birthdayRepository.findActiveByGuildId(input.guildId);
		if (birthdays.length === 0) {
			const { language, timeZone } = await getGuildLocaleAndTimezone(this.guildRepository, input.guildId);
			return { status: 'success', data: { sortMode, language, timeZone, entries: [] } };
		}

		const { language, timeZone } = await getGuildLocaleAndTimezone(this.guildRepository, input.guildId);
		const sortedBirthdays = sortBirthdaysForDisplay(birthdays, sortMode, timeZone);

		const entries = sortedBirthdays.map((birthday) => ({
			userId: birthday.userId,
			date: formatBirthdayDateWithYear(birthday.birthday, timeZone, language),
			daysUntil: getDaysUntilNextBirthday(birthday.birthday, timeZone),
			age: getAgeAtNextBirthday(birthday.birthday, timeZone)
		}));

		return { status: 'success', data: { sortMode, language, timeZone, entries } };
	}
}
