import { describe, expect, it } from 'vitest';
import { Guild } from '#lib/domain/guild/Guild';

function createGuild(overrides: Partial<ConstructorParameters<typeof Guild>[0]> = {}): Guild {
	return new Guild({
		guildId: '123',
		inviter: null,
		announcementChannel: '111',
		announcementMessage: 'Happy birthday!',
		overviewChannel: '222',
		overviewMessage: 'Overview',
		overviewSort: 'month',
		birthdayRole: '333',
		birthdayPingRole: '444',
		logChannel: '555',
		timezone: 'Europe/Paris',
		premium: true,
		language: 'en-US',
		lastUpdated: new Date('2026-01-01T00:00:00.000Z'),
		disabled: false,
		...overrides
	});
}

describe('Guild', () => {
	it('reports presence of optional channels and roles', () => {
		const guild = createGuild();
		expect(guild.hasAnnouncementChannel()).toBe(true);
		expect(guild.hasOverviewChannel()).toBe(true);
		expect(guild.hasBirthdayRole()).toBe(true);
		expect(guild.hasBirthdayPingRole()).toBe(true);
		expect(guild.hasLogChannel()).toBe(true);
	});

	it('returns false for missing optional channels and roles', () => {
		const guild = createGuild({
			announcementChannel: null,
			overviewChannel: null,
			birthdayRole: null,
			birthdayPingRole: null,
			logChannel: null
		});

		expect(guild.hasAnnouncementChannel()).toBe(false);
		expect(guild.hasOverviewChannel()).toBe(false);
		expect(guild.hasBirthdayRole()).toBe(false);
		expect(guild.hasBirthdayPingRole()).toBe(false);
		expect(guild.hasLogChannel()).toBe(false);
	});

	it('reflects premium and active flags', () => {
		const premiumActive = createGuild({ premium: true, disabled: false });
		expect(premiumActive.isPremium()).toBe(true);
		expect(premiumActive.isActive()).toBe(true);

		const freeDisabled = createGuild({ premium: false, disabled: true });
		expect(freeDisabled.isPremium()).toBe(false);
		expect(freeDisabled.isActive()).toBe(false);
	});
});