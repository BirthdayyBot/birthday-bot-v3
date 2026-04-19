import { describe, expect, it } from 'vitest';
import { buildBirthday, formatBirthdayDate, getAgeAtNextBirthday, getNextBirthdayDate } from '../../src/lib/utilities/birthday-command';

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
});
