import { container } from '@sapphire/framework';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import { formatBirthdayDate, formatTimeUntilNextBirthday, getAgeAtNextBirthday, getNextBirthdayDate } from '#lib/utilities/birthday-command';

const MAX_OVERVIEW_LINES = 50;
const MAX_DESCRIPTION_LENGTH = 3900;
const OVERVIEW_SORT_UPCOMING = 'upcoming';

function truncateText(text: string, limit: number): string {
	if (text.length <= limit) return text;
	return `${text.slice(0, Math.max(0, limit - 3))}...`;
}

function interpolateTemplate(template: string, values?: Record<string, string | number>): string {
	if (!values) return template;

	let output = template;
	for (const [key, value] of Object.entries(values)) {
		output = output.replaceAll(`{{${key}}}`, String(value));
	}

	return output;
}

async function localize(language: string, key: unknown, values?: Record<string, string | number>): Promise<string> {
	const raw = await Promise.resolve(container.i18n.format(language, key as never, values));
	return interpolateTemplate(String(raw), values);
}

async function buildOverviewEmbed(guildId: string) {
	const guildConfig = await container.guild.findById(guildId);
	if (!guildConfig || !guildConfig.isActive() || !guildConfig.hasOverviewChannel()) return null;

	const birthdays = await container.birthday.findActiveByGuildId(guildId);
	const sortedBirthdays = birthdays
		.map((birthday) => ({
			birthday,
			month: birthday.getMonth(),
			day: birthday.getDay(),
			nextDate: getNextBirthdayDate(birthday.birthday, guildConfig.timezone)
		}))
		.sort((a, b) => {
			if (guildConfig.overviewSort === OVERVIEW_SORT_UPCOMING) {
				const leftNextDate = a.nextDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
				const rightNextDate = b.nextDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
				if (leftNextDate !== rightNextDate) return leftNextDate - rightNextDate;
			}

			if (a.month !== b.month) return a.month - b.month;
			if (a.day !== b.day) return a.day - b.day;
			return a.birthday.userId.localeCompare(b.birthday.userId);
		});

	const rows = await Promise.all(
		sortedBirthdays.slice(0, MAX_OVERVIEW_LINES).map(async ({ birthday }) => {
			const date = formatBirthdayDate(birthday.birthday, guildConfig.language);
			const timeUntil = formatTimeUntilNextBirthday(birthday.birthday, guildConfig.timezone);
			const age = getAgeAtNextBirthday(birthday.birthday, guildConfig.timezone);

			if (age !== null) {
				return localize(guildConfig.language, LanguageKeys.Commands.Birthday.SubcommandListResponseEntryWithAge, {
					userId: birthday.userId,
					date,
					age,
					timeUntil
				});
			}

			return localize(guildConfig.language, LanguageKeys.Commands.Birthday.SubcommandListResponseEntryWithoutAge, {
				userId: birthday.userId,
				date,
				timeUntil
			});
		})
	);

	const title = await localize(guildConfig.language, LanguageKeys.Commands.Birthday.SubcommandListResponseTitle, {
		page: 1,
		totalPages: 1
	});

	const descriptionLines: string[] = [];
	if (rows.length === 0) {
		descriptionLines.push(await localize(guildConfig.language, LanguageKeys.Commands.Birthday.SubcommandListResponseEmpty));
	} else {
		descriptionLines.push(
			await localize(guildConfig.language, LanguageKeys.Commands.Birthday.SubcommandListResponseDescription, {
				total: birthdays.length
			})
		);
		descriptionLines.push(rows.join('\n'));

		if (birthdays.length > MAX_OVERVIEW_LINES) {
			descriptionLines.push(`... (${birthdays.length - MAX_OVERVIEW_LINES} more)`);
		}
	}

	const description = truncateText(descriptionLines.join('\n\n'), MAX_DESCRIPTION_LENGTH);
	return {
		guildConfig,
		embed: createDefaultEmbed(description, 'info').setTitle(title)
	};
}

export async function upsertBirthdayOverviewMessage(guildId: string): Promise<void> {
	const payload = await buildOverviewEmbed(guildId);
	if (!payload) return;

	const guild = await container.client.guilds.fetch(guildId).catch(() => null);
	if (!guild) return;

	const channel = await guild.channels.fetch(payload.guildConfig.overviewChannel!).catch(() => null);
	if (!channel || !channel.isTextBased() || !('send' in channel) || !('messages' in channel)) return;

	if (payload.guildConfig.overviewMessage) {
		const existingMessage = await channel.messages.fetch(payload.guildConfig.overviewMessage).catch(() => null);
		if (existingMessage) {
			const editSucceeded = await existingMessage
				.edit({
					embeds: [payload.embed],
					allowedMentions: { users: [], roles: [] }
				})
				.then(() => true)
				.catch(() => false);

			if (editSucceeded) {
				return;
			}

			await container.guild.update(guildId, { overviewMessage: null });
		} else {
			await container.guild.update(guildId, { overviewMessage: null });
		}
	}

	const sent = await channel
		.send({
			embeds: [payload.embed],
			allowedMentions: { users: [], roles: [] }
		})
		.catch(() => null);

	if (!sent) return;
	await container.guild.update(guildId, { overviewMessage: sent.id });
}
