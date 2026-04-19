import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { sendBirthdayAnnouncement } from '#lib/utilities/announcement-message';

export interface ZonedDateParts {
	year: number;
	month: number;
	day: number;
	hour: number;
}

function getZonedDateParts(timeZone: string): ZonedDateParts {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hour12: false
	}).formatToParts(new Date());

	return {
		year: Number(parts.find((part) => part.type === 'year')?.value),
		month: Number(parts.find((part) => part.type === 'month')?.value),
		day: Number(parts.find((part) => part.type === 'day')?.value),
		hour: Number(parts.find((part) => part.type === 'hour')?.value)
	};
}

function isLeapYear(year: number): boolean {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function formatMonthDay(month: number, day: number): string {
	return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatDateKey(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getPreviousDay(parts: ZonedDateParts): ZonedDateParts {
	const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
	utcDate.setUTCDate(utcDate.getUTCDate() - 1);

	return {
		year: utcDate.getUTCFullYear(),
		month: utcDate.getUTCMonth() + 1,
		day: utcDate.getUTCDate(),
		hour: parts.hour
	};
}

function parseBirthdayMonthDay(birthday: string): { month: number; day: number } | null {
	const [monthPart, dayPart] = birthday.split('-');
	const month = Number(monthPart);
	const day = Number(dayPart);

	if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
	if (month < 1 || month > 12 || day < 1 || day > 31) return null;

	return { month, day };
}

export function isBirthdayForDate(birthday: string, year: number, month: number, day: number): boolean {
	const parsed = parseBirthdayMonthDay(birthday);
	if (!parsed) return false;

	if (parsed.month === 2 && parsed.day === 29 && !isLeapYear(year)) {
		return month === 2 && day === 28;
	}

	return parsed.month === month && parsed.day === day;
}

export function getCatchupTargetDates(now: ZonedDateParts): Array<{ year: number; month: number; day: number }> {
	if (now.hour >= 9) {
		return [{ year: now.year, month: now.month, day: now.day }];
	}

	const previous = getPreviousDay(now);
	return [{ year: previous.year, month: previous.month, day: previous.day }];
}

export class BirthdayAnnouncementsTask extends ScheduledTask<'birthdayAnnouncements'> {
	private readonly announcedToday = new Set<string>();

	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			name: 'birthdayAnnouncements',
			pattern: '0 * * * *',
			timezone: 'UTC'
		});
	}

	public override async run() {
		this.pruneAnnouncedCache();

		for (const cachedGuild of this.container.client.guilds.cache.values()) {
			const guildConfig = await this.container.guild.findById(cachedGuild.id);
			if (!guildConfig || !guildConfig.isActive() || !guildConfig.hasAnnouncementChannel()) continue;

			const zonedNow = getZonedDateParts(guildConfig.timezone);
			const birthdays = await this.container.birthday.findActiveByGuildId(cachedGuild.id);
			const targetDates = getCatchupTargetDates(zonedNow);
			if (targetDates.length === 0) continue;

			const guild = await this.container.client.guilds.fetch(cachedGuild.id).catch(() => null);
			if (!guild) continue;

			const channel = await guild.channels.fetch(guildConfig.announcementChannel!).catch(() => null);
			if (!channel || !channel.isTextBased() || !('send' in channel)) continue;

			for (const targetDate of targetDates) {
				const dateKey = formatDateKey(targetDate.year, targetDate.month, targetDate.day);
				const dateBirthdays = birthdays.filter((birthday) =>
					isBirthdayForDate(birthday.birthday, targetDate.year, targetDate.month, targetDate.day)
				);

				for (const birthday of dateBirthdays) {
					const announcementKey = `${cachedGuild.id}:${birthday.userId}:${dateKey}`;
					if (this.announcedToday.has(announcementKey)) continue;

					const member = await sendBirthdayAnnouncement({
						guild,
						channel,
						userId: birthday.userId,
						config: guildConfig
					});

					if (guildConfig.birthdayRole) {
						if (member && !member.roles.cache.has(guildConfig.birthdayRole)) {
							await member.roles.add(guildConfig.birthdayRole).catch(() => null);
						}

						await this.container.tasks.create(
							{
								name: 'birthdayRoleReset',
								payload: {
									guildId: cachedGuild.id,
									userId: birthday.userId,
									roleId: guildConfig.birthdayRole,
									dateKey
								}
							},
							{
								repeated: false,
								delay: 24 * 60 * 60 * 1000,
								customJobOptions: {
									jobId: `birthdayRoleReset:${cachedGuild.id}:${birthday.userId}:${dateKey}`
								}
							}
						);
					}

					this.announcedToday.add(announcementKey);
				}
			}
		}
	}

	private pruneAnnouncedCache(): void {
		if (this.announcedToday.size <= 10_000) return;
		this.announcedToday.clear();
	}
}
