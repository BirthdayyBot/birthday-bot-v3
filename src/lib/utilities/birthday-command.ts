import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { container } from '@sapphire/framework';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { replyError } from '#lib/utilities/default-embed';
import { PermissionFlagsBits, type GuildMember, type SlashCommandSubcommandBuilder } from 'discord.js';
import type { Command } from '@kaname-png/plugin-subcommands-advanced';
import type { TypedT } from '#lib/types/Utils';

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DEFAULT_GUILD_LANGUAGE = 'en-US';
const DEFAULT_GUILD_TIMEZONE = 'Europe/London';

interface BirthdayParts {
	month: number;
	day: number;
	year: number | null;
}

function isLeapYear(year: number): boolean {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getDaysInMonth(month: number, year: number | null): number {
	if (month === 2 && year !== null && !isLeapYear(year)) return 28;
	return DAYS_IN_MONTH[month - 1] ?? 0;
}

function getZonedDateParts(timeZone: string): { year: number; month: number; day: number } {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(new Date());

	const year = Number(parts.find((part) => part.type === 'year')?.value);
	const month = Number(parts.find((part) => part.type === 'month')?.value);
	const day = Number(parts.find((part) => part.type === 'day')?.value);

	return { year, month, day };
}

function getCelebrationDayForYear(month: number, day: number, year: number): number {
	if (month === 2 && day === 29 && !isLeapYear(year)) return 28;
	return day;
}

function getNextCelebrationYear(month: number, day: number, current: { year: number; month: number; day: number }): number {
	const celebrationDayThisYear = getCelebrationDayForYear(month, day, current.year);
	if (current.month > month || (current.month === month && current.day > celebrationDayThisYear)) {
		return current.year + 1;
	}

	return current.year;
}

function parseBirthdayParts(birthday: string): BirthdayParts | null {
	const parts = birthday.split('-');
	if (parts.length < 2 || parts.length > 3) return null;

	const month = Number(parts[0]);
	const day = Number(parts[1]);
	const year = parts.length === 3 ? Number(parts[2]) : null;

	if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
	if (year !== null && (!Number.isInteger(year) || year < 1)) return null;
	if (month < 1 || month > 12) return null;
	if (day < 1 || day > getDaysInMonth(month, year)) return null;

	return { month, day, year };
}

function getNextBirthdayDate(birthday: string, timeZone: string): Date | null {
	const parsed = parseBirthdayParts(birthday);
	if (!parsed) return null;

	const current = getZonedDateParts(timeZone);
	const year = getNextCelebrationYear(parsed.month, parsed.day, current);
	const day = getCelebrationDayForYear(parsed.month, parsed.day, year);

	if (current.year === year && current.month === parsed.month && current.day === day) {
		return new Date();
	}

	return new Date(Date.UTC(year, parsed.month - 1, day, 12, 0, 0));
}

/** Builds a "MM-DD" or "MM-DD-YYYY" string. Returns null if the day is invalid for the month. */
export function buildBirthday(month: number, day: number, year?: number | null): string | null {
	if (month < 1 || month > 12 || day < 1 || day > getDaysInMonth(month, year ?? null)) return null;
	const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	return year ? `${mmdd}-${year}` : mmdd;
}

/** Formats a stored birthday ("MM-DD" or "MM-DD-YYYY") into a locale-aware string, e.g. "21 mars" or "March 21". */
export function formatBirthdayDate(birthday: string, locale: string): string {
	const parsed = parseBirthdayParts(birthday);
	if (!parsed) return birthday;
	const date = new Date(2000, parsed.month - 1, parsed.day);
	return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(date);
}

/** Returns the age the person will turn at their next upcoming birthday, or null if no year is stored. */
export function getAgeAtNextBirthday(birthday: string, timeZone: string): number | null {
	const parsed = parseBirthdayParts(birthday);
	if (!parsed || parsed.year === null) return null;

	const current = getZonedDateParts(timeZone);
	const nextCelebrationYear = getNextCelebrationYear(parsed.month, parsed.day, current);
	return nextCelebrationYear - parsed.year;
}

/** Returns a Discord relative timestamp string for the next birthday, e.g. "<t:1234567890:R>". */
export function formatTimeUntilNextBirthday(birthday: string, timeZone: string): string {
	const next = getNextBirthdayDate(birthday, timeZone);
	if (!next) return '<t:0:R>';
	return `<t:${Math.floor(next.getTime() / 1000)}:R>`;
}

/** Fetches the guild's configured language, falling back to en-US. */
export async function getGuildLanguage(guildId: string): Promise<string> {
	const guild = await container.guild.findById(guildId);
	return guild?.language ?? DEFAULT_GUILD_LANGUAGE;
}

/** Fetches the guild's configured language and timezone with safe defaults. */
export async function getGuildLocaleAndTimezone(guildId: string): Promise<{ language: string; timeZone: string }> {
	const guild = await container.guild.findById(guildId);
	return {
		language: guild?.language ?? DEFAULT_GUILD_LANGUAGE,
		timeZone: guild?.timezone ?? DEFAULT_GUILD_TIMEZONE
	};
}

/** Adds day + month (choices) + year + member options. Use for register/update. */
export function applyBirthdayOptions(sub: SlashCommandSubcommandBuilder, memberDescriptionKey: TypedT) {
	return sub
		.addIntegerOption((option) =>
			applyDescriptionLocalizedBuilder(
				option.setName('day').setDescription('Birth day (1–31)').setRequired(true).setMinValue(1).setMaxValue(31),
				LanguageKeys.Commands.Birthday.SubcommandOptionDayDescription
			)
		)
		.addIntegerOption((option) =>
			applyDescriptionLocalizedBuilder(
				option
					.setName('month')
					.setDescription('Birth month')
					.setRequired(true)
					.addChoices(
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthJanuary, { value: 1 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthFebruary, { value: 2 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthMarch, { value: 3 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthApril, { value: 4 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthMay, { value: 5 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthJune, { value: 6 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthJuly, { value: 7 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthAugust, { value: 8 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthSeptember, { value: 9 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthOctober, { value: 10 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthNovember, { value: 11 }),
						createLocalizedChoice(LanguageKeys.Commands.Birthday.MonthDecember, { value: 12 })
					),
				LanguageKeys.Commands.Birthday.SubcommandOptionMonthDescription
			)
		)
		.addIntegerOption((option) =>
			applyDescriptionLocalizedBuilder(
				option
					.setName('year')
					.setDescription('Birth year (optional)')
					.setRequired(false)
					.setMinValue(1900)
					.setMaxValue(new Date().getFullYear()),
				LanguageKeys.Commands.Birthday.SubcommandOptionYearDescription
			)
		)
		.addUserOption((option) =>
			applyDescriptionLocalizedBuilder(option.setName('member').setDescription('Member').setRequired(false), memberDescriptionKey)
		);
}

/** Adds only the member option. Use for delete/view. */
export function applyMemberOption(sub: SlashCommandSubcommandBuilder, memberDescriptionKey: TypedT) {
	return sub.addUserOption((option) =>
		applyDescriptionLocalizedBuilder(option.setName('member').setDescription('Member').setRequired(false), memberDescriptionKey)
	);
}

export async function resolveBirthdayTarget(interaction: Command.ChatInputCommandInteraction): Promise<{ targetId: string; isSelf: boolean } | null> {
	const targetUser = interaction.options.getUser('member');
	const isSelf = !targetUser || targetUser.id === interaction.user.id;

	if (!isSelf) {
		const executor = interaction.member as GuildMember;
		if (!executor.permissions.has(PermissionFlagsBits.ManageGuild)) {
			await interaction.reply(
				replyError(await resolveKey(interaction, LanguageKeys.Commands.Birthday.ErrorMissingPermission), interaction.user)
			);
			return null;
		}
	}

	return { targetId: isSelf ? interaction.user.id : targetUser!.id, isSelf };
}
