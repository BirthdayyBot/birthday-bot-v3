import { describe, expect, it } from 'vitest';
import {
	formatDateKey,
	formatMonthDay,
	getCatchupTargetDates,
	isBirthdayForDate,
	type ZonedDateParts
} from '../../src/scheduled-tasks/birthday-announcements';
import { formatBirthdayMessage, renderAnnouncementMessage } from '../../src/lib/utilities/announcement-message';

describe('birthday-announcements helpers', () => {
	it('formats month/day and date keys', () => {
		expect(formatMonthDay(2, 8)).toBe('02-08');
		expect(formatDateKey(2026, 4, 9)).toBe('2026-04-09');
	});

	it('renders announcement placeholders', () => {
		const message = renderAnnouncementMessage('Happy birthday {MENTION}!{NEW_LINE}Enjoy!', {
			mention: '<@1234>'
		});
		expect(message).toBe('Happy birthday <@1234>!\nEnjoy!');
	});

	it('formats legacy birthday placeholders from member and guild context', () => {
		const member = {
			id: '1234',
			user: {
				username: 'Alice',
				discriminator: '0420'
			}
		} as any;

		const guild = {
			id: '9999',
			name: 'Birthday Club'
		} as any;

		const template = '{USERNAME}#{DISCRIMINATOR} in {GUILD_NAME} ({GUILD_ID}) {MENTION}{NEW_LINE}Welcome to {SERVERNAME}!';
		const message = formatBirthdayMessage(template, member, guild);

		expect(message).toBe('Alice#0420 in Birthday Club (9999) <@1234>\nWelcome to Birthday Club!');
	});

	it('supports leap-day birthday fallback to february 28 on non-leap years', () => {
		expect(isBirthdayForDate('02-29-2000', 2025, 2, 28)).toBe(true);
		expect(isBirthdayForDate('02-29-2000', 2024, 2, 29)).toBe(true);
		expect(isBirthdayForDate('02-29-2000', 2025, 3, 1)).toBe(false);
	});

	it('returns only today for regular daily run at or after 09:00 local', () => {
		const now: ZonedDateParts = { year: 2026, month: 4, day: 19, hour: 10 };
		expect(getCatchupTargetDates(now)).toEqual([{ year: 2026, month: 4, day: 19 }]);
	});

	it('returns yesterday for 24h catch-up before 09:00 local', () => {
		const now: ZonedDateParts = { year: 2026, month: 4, day: 19, hour: 8 };
		expect(getCatchupTargetDates(now)).toEqual([{ year: 2026, month: 4, day: 18 }]);
	});

	it('handles month/year boundaries for catch-up dates', () => {
		const firstOfMonth: ZonedDateParts = { year: 2026, month: 3, day: 1, hour: 1 };
		expect(getCatchupTargetDates(firstOfMonth)).toEqual([{ year: 2026, month: 2, day: 28 }]);

		const firstOfYear: ZonedDateParts = { year: 2027, month: 1, day: 1, hour: 2 };
		expect(getCatchupTargetDates(firstOfYear)).toEqual([{ year: 2026, month: 12, day: 31 }]);
	});
});
