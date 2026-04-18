import { readFile } from 'node:fs/promises';
import { srcFolder } from '#utils/constants';

const tz = new Map<string, TimeZone>();

export let MinimumLength = 100;
export const MaximumLength = 100;

{
	const tzCountries = new Map<string, TimeZoneCountry>();
	const tzCountryNames = new Map<string, string>();

	const pathCountryCodes = new URL('generated/data/tz-country-codes.json', srcFolder);
	for (const entry of JSON.parse(await readFile(pathCountryCodes, 'utf8')) as RawTimeZoneCountry[]) {
		tzCountries.set(entry.code, { code: entry.code.toLowerCase(), name: entry.name.toLowerCase() });
		tzCountryNames.set(entry.code, entry.name);
	}

	const pathTz = new URL('generated/data/tz.json', srcFolder);
	for (const entry of JSON.parse(await readFile(pathTz, 'utf8')) as RawTimeZone[]) {
		const name = toCanonicalIana(entry.name);
		const countries = entry.codes.map((code) => tzCountries.get(code)!);
		const countryNames = entry.codes.map((code) => tzCountryNames.get(code)!);
		const full = cut(`${name} (${countryNames.join(', ')})`, MaximumLength - 2);
		tz.set(name.toLowerCase(), { name, countries, full });

		if (name.length < MinimumLength) MinimumLength = name.length;
	}
}

const defaults = [
	'asia/kolkata',
	'america/los_angeles',
	'america/new_york',
	'america/phoenix',
	'europe/london',
	'pacific/auckland',
	'europe/paris',
	'america/mexico_city',
	'australia/sydney',
	'australia/brisbane',
	'america/toronto',
	'america/sao_paulo',
	'america/argentina/buenos_aires',
	'asia/tokyo',
	'europe/madrid',
	'asia/singapore',
	'asia/bangkok',
	'europe/istanbul',
	'asia/seoul',
	'europe/berlin',
	'asia/shanghai',
	'africa/cairo'
].map((value) => ({ score: 1, value: tz.get(value)! }) satisfies TimeZoneSearchResult);

export function getTimeZone(id: string): TimeZone | null {
	return tz.get(toCanonicalIana(id).toLowerCase()) ?? null;
}

export function searchTimeZone(id: string): readonly TimeZoneSearchResult[] {
	if (id.length === 0) return defaults;
	if (id.length > MaximumLength) return [];

	id = toSearchable(id).toLowerCase();
	const entries: TimeZoneSearchResult[] = [];
	for (const [key, value] of tz.entries()) {
		const score = getSearchScore(id, key, value);
		if (score !== 0) entries.push({ score, value });
	}

	return entries.sort((a, b) => b.score - a.score).slice(0, 25);
}

function getSearchScore(id: string, key: string, value: TimeZone): number {
	const normalizedKey = toSearchable(key);
	if (normalizedKey === id) return 1;

	let score = normalizedKey.includes(id) ? id.length / normalizedKey.length : 0;
	for (const country of value.countries) {
		if (country.name === id || country.code === id) return 1;
		if (country.name.includes(id)) score = Math.max(score, id.length / country.name.length);
	}

	return score;
}

function cut(str: string, max: number): string {
	return str.length <= max ? str : `${str.slice(0, max - 1)}…`;
}

function toCanonicalIana(value: string): string {
	return value.replaceAll(' ', '_');
}

function toSearchable(value: string): string {
	return toCanonicalIana(value).replaceAll('_', ' ');
}

export interface TimeZone {
	name: string;
	countries: TimeZoneCountry[];
	full: string;
}

export interface TimeZoneCountry {
	code: string;
	name: string;
}

export interface TimeZoneSearchResult {
	score: number;
	value: TimeZone;
}

interface RawTimeZone {
	codes: string[];
	name: string;
}

interface RawTimeZoneCountry {
	code: string;
	name: string;
}
