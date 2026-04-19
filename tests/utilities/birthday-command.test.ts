import { afterEach, describe, expect, it, vi } from 'vitest';
import { Birthday } from '#lib/domain/birthday/Birthday';
import {
	BIRTHDAY_SORT_MONTH,
	BIRTHDAY_SORT_UPCOMING,
	buildBirthday,
	formatBirthdayDate,
	formatTimeUntilNextBirthday,
	getAgeAtNextBirthday,
	getNextBirthdayDate,
	normalizeBirthdaySortMode,
	sortBirthdaysForDisplay
} from '#lib/utilities/birthday-command';

describe('birthday-command XXXX year support', () => {
	it('treats MM-DD-XXXX as unknown year (no age)', () => {
		expect(getAgeAtNextBirthday('05-21-XXXX', 'Europe/Paris')).toBeNull();
	});

	it('still computes next birthday date for MM-DD-XXXX', () => {
		const next = getNextBirthdayDate('05-21-XXXX', 'Europe/Paris');
		expect(next).not.toBeNull();
	});

	it('formats MM-DD-XXXX like a regular month/day date', () => {
		const formatted = formatBirthdayDate('05-21-XXXX', 'en-US');
		expect(formatted).toContain('21');
	});

	it('builds MM-DD-XXXX when year is omitted', () => {
		expect(buildBirthday(5, 21)).toBe('05-21-XXXX');
	});

	it('returns null for impossible day/month combinations', () => {
		expect(buildBirthday(2, 29, 2025)).toBeNull();
		expect(buildBirthday(4, 31, 2024)).toBeNull();
	});

	it('accepts leap day for leap years', () => {
		expect(buildBirthday(2, 29, 2024)).toBe('02-29-2024');
	});
});

describe('birthday sorting reliability', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('normalizes unknown sort values to month', () => {
		expect(normalizeBirthdaySortMode('invalid')).toBe(BIRTHDAY_SORT_MONTH);
		expect(normalizeBirthdaySortMode(null)).toBe(BIRTHDAY_SORT_MONTH);
		expect(normalizeBirthdaySortMode(undefined)).toBe(BIRTHDAY_SORT_MONTH);
		expect(normalizeBirthdaySortMode(BIRTHDAY_SORT_UPCOMING)).toBe(BIRTHDAY_SORT_UPCOMING);
	});

	it('sorts by upcoming date when requested', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-12-30T12:00:00.000Z'));

		const birthdays = [
			new Birthday({ id: 1n, userId: 'z', guildId: '1', birthday: '01-16-XXXX', disabled: false }),
			new Birthday({ id: 2n, userId: 'a', guildId: '1', birthday: '12-31-XXXX', disabled: false }),
			new Birthday({ id: 3n, userId: 'm', guildId: '1', birthday: '01-20-XXXX', disabled: false })
		];

		const monthSorted = sortBirthdaysForDisplay(birthdays, BIRTHDAY_SORT_MONTH, 'Europe/Paris');
		expect(monthSorted.map((entry: { birthday: any }) => entry.birthday)).toEqual(['01-16-XXXX', '01-20-XXXX', '12-31-XXXX']);

		const upcomingSorted = sortBirthdaysForDisplay(birthdays, BIRTHDAY_SORT_UPCOMING, 'Europe/Paris');
		expect(upcomingSorted.map((entry: { birthday: any }) => entry.birthday)).toEqual(['12-31-XXXX', '01-16-XXXX', '01-20-XXXX']);
	});

	it('falls back to month sort when mode is unknown', () => {
		const birthdays = [
			new Birthday({ id: 1n, userId: 'z', guildId: '1', birthday: '12-31-XXXX', disabled: false }),
			new Birthday({ id: 2n, userId: 'a', guildId: '1', birthday: '01-05-XXXX', disabled: false })
		];

		const sorted = sortBirthdaysForDisplay(birthdays, 'not-a-mode', 'Europe/Paris');
		expect(sorted.map((entry: { birthday: any }) => entry.birthday)).toEqual(['01-05-XXXX', '12-31-XXXX']);
	});

	it('pushes invalid birthday values to the end in upcoming mode', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));

		const birthdays = [
			new Birthday({ id: 1n, userId: 'invalid', guildId: '1', birthday: '99-99-XXXX', disabled: false }),
			new Birthday({ id: 2n, userId: 'valid', guildId: '1', birthday: '03-02-XXXX', disabled: false })
		];

		const sorted = sortBirthdaysForDisplay(birthdays, BIRTHDAY_SORT_UPCOMING, 'Europe/Paris');
		expect(sorted.map((entry: { userId: any }) => entry.userId)).toEqual(['valid', 'invalid']);
	});

	it('pushes invalid birthday values to the end in month mode', () => {
		const birthdays = [
			new Birthday({ id: 1n, userId: 'invalid', guildId: '1', birthday: '13-99-XXXX', disabled: false }),
			new Birthday({ id: 2n, userId: 'valid', guildId: '1', birthday: '01-10-XXXX', disabled: false })
		];

		const sorted = sortBirthdaysForDisplay(birthdays, BIRTHDAY_SORT_MONTH, 'Europe/Paris');
		expect(sorted.map((entry: { userId: any }) => entry.userId)).toEqual(['valid', 'invalid']);
	});

	it('returns end-of-day timestamp when birthday is today in timezone', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-05-21T10:00:00.000Z'));

		const next = getNextBirthdayDate('05-21-XXXX', 'UTC');
		expect(next).not.toBeNull();
		expect(next!.toISOString()).toBe('2026-05-21T23:59:59.000Z');
	});

	it('returns placeholder relative timestamp for invalid birthday values', () => {
		expect(formatTimeUntilNextBirthday('invalid', 'UTC')).toBe('<t:0:R>');
	});

	it('keeps deterministic tie-breakers by userId when dates are equal', () => {
		const birthdays = [
			new Birthday({ id: 1n, userId: 'beta', guildId: '1', birthday: '04-10-XXXX', disabled: false }),
			new Birthday({ id: 2n, userId: 'alpha', guildId: '1', birthday: '04-10-XXXX', disabled: false })
		];

		const sorted = sortBirthdaysForDisplay(birthdays, BIRTHDAY_SORT_MONTH, 'Europe/Paris');
		expect(sorted.map((entry: { userId: any }) => entry.userId)).toEqual(['alpha', 'beta']);
	});

	it('handles Feb 29 in non-leap years with stable ordering', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));

		const birthdays = [
			new Birthday({ id: 1n, userId: 'zeta', guildId: '1', birthday: '02-29-2000', disabled: false }),
			new Birthday({ id: 2n, userId: 'alpha', guildId: '1', birthday: '02-28-1999', disabled: false })
		];

		const sorted = sortBirthdaysForDisplay(birthdays, BIRTHDAY_SORT_UPCOMING, 'Europe/Paris');
		expect(sorted.map((entry: { userId: any }) => entry.userId)).toEqual(['alpha', 'zeta']);
	});
});
