import {
	formatBirthdayDate,
	formatTimeUntilNextBirthday,
	getAgeAtNextBirthday,
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
	timeUntil: string;
	age: number | null;
}

export interface BirthdayListData {
	sortMode: BirthdaySortMode;
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
			return { status: 'success', data: { sortMode, entries: [] } };
		}

		const { language, timeZone } = await getGuildLocaleAndTimezone(this.guildRepository, input.guildId);
		const sortedBirthdays = sortBirthdaysForDisplay(birthdays, sortMode, timeZone);

		const entries = sortedBirthdays.map((birthday) => ({
			userId: birthday.userId,
			date: formatBirthdayDate(birthday.birthday, language),
			timeUntil: formatTimeUntilNextBirthday(birthday.birthday, timeZone),
			age: getAgeAtNextBirthday(birthday.birthday, timeZone)
		}));

		return { status: 'success', data: { sortMode, entries } };
	}
}
