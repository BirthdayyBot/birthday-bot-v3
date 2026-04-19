import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Birthday } from '#lib/domain/birthday/Birthday';
import { createFakeDiscordContext, createFakeOverviewEmbedFactory } from '../infrastructure/fakes/discord/discord-context.fake';
import { createFakeGuildConfig } from '../infrastructure/fakes/repositories/guild-config.fake';

const createDefaultEmbedMock = createFakeOverviewEmbedFactory();

const mockedContainer = {
	i18n: { format: vi.fn() },
	guild: {
		findById: vi.fn(),
		update: vi.fn()
	},
	birthday: {
		findActiveByGuildId: vi.fn()
	},
	client: {
		guilds: {
			fetch: vi.fn()
		}
	}
};

vi.mock('@sapphire/framework', () => ({
	container: mockedContainer
}));

vi.mock('#lib/utilities/default-embed', () => ({
	createDefaultEmbed: (...args: unknown[]) => createDefaultEmbedMock(...args)
}));

describe('overview-message upsert flow', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockedContainer.i18n.format.mockImplementation((_language: string, _key: unknown, values?: Record<string, unknown>) => {
			if (!values) return 'localized';
			if ('page' in values && 'totalPages' in values) return `title-${values.page}-${values.totalPages}`;
			if ('total' in values) return `total-${values.total}`;
			if ('userId' in values && 'age' in values) return `row-${values.userId}-age-${values.age}`;
			if ('userId' in values) return `row-${values.userId}`;
			return 'localized';
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('sends a new overview message sorted by upcoming order', async () => {
		const guildConfig = createFakeGuildConfig({ overviewSort: 'upcoming' });

		const birthdays = [
			new Birthday({ id: 1n, userId: 'z-user', guildId: 'guild-1', birthday: '12-31-XXXX', disabled: false }),
			new Birthday({ id: 2n, userId: 'a-user', guildId: 'guild-1', birthday: '01-01-XXXX', disabled: false })
		];

		const { send, guild } = createFakeDiscordContext({ sendResultId: 'sent-message-id' });

		mockedContainer.guild.findById.mockResolvedValue(guildConfig);
		mockedContainer.birthday.findActiveByGuildId.mockResolvedValue(birthdays);
		mockedContainer.client.guilds.fetch.mockResolvedValue(guild);

		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-12-30T10:00:00.000Z'));

		const { upsertBirthdayOverviewMessage } = await import('#lib/utilities/overview-message');
		await upsertBirthdayOverviewMessage('guild-1');

		expect(send).toHaveBeenCalledTimes(1);
		const payload = send.mock.calls[0][0];
		expect(payload.embeds).toHaveLength(1);
		expect(payload.embeds[0].description).toContain('row-z-user');
		expect(payload.embeds[0].description).toContain('row-a-user');
		expect(payload.embeds[0].description.indexOf('row-z-user')).toBeLessThan(payload.embeds[0].description.indexOf('row-a-user'));
		expect(mockedContainer.guild.update).toHaveBeenCalledWith('guild-1', { overviewMessage: 'sent-message-id' });
	});

	it('edits existing overview message when stored message id is valid', async () => {
		const guildConfig = createFakeGuildConfig({ overviewMessage: 'existing-message-id' });

		const birthdays = [new Birthday({ id: 1n, userId: 'user-1', guildId: 'guild-1', birthday: '04-10-XXXX', disabled: false })];
		const edit = vi.fn().mockResolvedValue({});
		const { send, guild } = createFakeDiscordContext({ existingMessage: { edit } });

		mockedContainer.guild.findById.mockResolvedValue(guildConfig);
		mockedContainer.birthday.findActiveByGuildId.mockResolvedValue(birthdays);
		mockedContainer.client.guilds.fetch.mockResolvedValue(guild);

		const { upsertBirthdayOverviewMessage } = await import('#lib/utilities/overview-message');
		await upsertBirthdayOverviewMessage('guild-1');

		expect(edit).toHaveBeenCalledTimes(1);
		expect(send).not.toHaveBeenCalled();
		expect(mockedContainer.guild.update).not.toHaveBeenCalled();
	});

	it('falls back to send when edit fails and refreshes stored message id', async () => {
		const guildConfig = createFakeGuildConfig({ overviewMessage: 'stale-message-id' });

		const birthdays = [new Birthday({ id: 1n, userId: 'user-2', guildId: 'guild-1', birthday: '05-10-XXXX', disabled: false })];
		const edit = vi.fn().mockRejectedValue(new Error('message no longer editable'));
		const { send, guild } = createFakeDiscordContext({ existingMessage: { edit }, sendResultId: 'fresh-message-id' });

		mockedContainer.guild.findById.mockResolvedValue(guildConfig);
		mockedContainer.birthday.findActiveByGuildId.mockResolvedValue(birthdays);
		mockedContainer.client.guilds.fetch.mockResolvedValue(guild);

		const { upsertBirthdayOverviewMessage } = await import('#lib/utilities/overview-message');
		await upsertBirthdayOverviewMessage('guild-1');

		expect(edit).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledTimes(1);
		expect(mockedContainer.guild.update).toHaveBeenNthCalledWith(1, 'guild-1', { overviewMessage: null });
		expect(mockedContainer.guild.update).toHaveBeenNthCalledWith(2, 'guild-1', { overviewMessage: 'fresh-message-id' });
	});
});
