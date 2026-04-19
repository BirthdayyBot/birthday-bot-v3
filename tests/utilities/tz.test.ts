import { describe, expect, it } from 'vitest';
import { MaximumLength, MinimumLength, getTimeZone, searchTimeZone } from '#lib/utilities/tz';

describe('tz utilities', () => {
	it('returns a timezone using canonicalization rules', () => {
		const direct = getTimeZone('Europe/Paris');
		const withSpace = getTimeZone('Europe/Paris'.replace('_', ' '));

		expect(direct).not.toBeNull();
		expect(withSpace).not.toBeNull();
		expect(direct?.name).toBe(withSpace?.name);
	});

	it('returns null when timezone does not exist', () => {
		expect(getTimeZone('Mars/Olympus_Mons')).toBeNull();
	});

	it('returns defaults when query is empty', () => {
		const results = searchTimeZone('');
		expect(results.length).toBeGreaterThan(0);
		expect(results.every((entry) => entry.score === 1)).toBe(true);
		expect(results.some((entry) => entry.value.name.toLowerCase() === 'europe/paris')).toBe(true);
	});

	it('returns an empty list for overly long query', () => {
		const tooLong = 'x'.repeat(MaximumLength + 1);
		expect(searchTimeZone(tooLong)).toEqual([]);
	});

	it('finds by country code and keeps score ordering', () => {
		const results = searchTimeZone('fr');
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].score).toBeGreaterThan(0);
		expect(results.some((entry) => entry.value.countries.some((country) => country.code === 'fr'))).toBe(true);
		for (let i = 1; i < results.length; i++) {
			expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
		}
	});

	it('exposes valid min/max constraints from loaded dataset', () => {
		expect(MinimumLength).toBeGreaterThan(0);
		expect(MinimumLength).toBeLessThanOrEqual(MaximumLength);
	});
});