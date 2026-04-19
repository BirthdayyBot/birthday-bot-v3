import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigTimezoneController } from '#lib/application/config-commands/ConfigTimezoneController';
import { ConfigLanguageController } from '#lib/application/config-commands/ConfigLanguageController';
import { ConfigViewController } from '#lib/application/config-commands/ConfigViewController';
import { ConfigOverviewSortController } from '#lib/application/config-commands/ConfigOverviewSortController';
import { LanguageKeys } from '#lib/i18n/languageKeys';

function makeGuildRepo(initial: Record<string, unknown> | null = null) {
	const store = new Map<string, Record<string, unknown>>();
	if (initial) store.set('g1', initial);
	return {
		store,
		findById: vi.fn(async (guildId: string) => store.get(guildId) ?? null),
		update: vi.fn(async (guildId: string, data: Record<string, unknown>) => {
			const current = store.get(guildId) ?? {};
			store.set(guildId, { ...current, ...data });
		}),
		upsert: vi.fn(async (data: { guildId: string; [key: string]: unknown }) => {
			store.set(data.guildId, data);
		}),
		setDisabled: vi.fn(),
		delete: vi.fn()
	};
}

beforeEach(() => vi.clearAllMocks());

describe('ConfigTimezoneController', () => {
	it('returns invalid for unknown timezone', async () => {
		const guildRepo = makeGuildRepo();
		const controller = new ConfigTimezoneController(guildRepo);
		const result = await controller.prepare({ guildId: 'g1', value: 'Not/AZone' });
		expect(result).toMatchObject({ status: 'warning', code: 'invalid', args: { timezone: 'Not/AZone' } });
	});

	it('returns already-set when current timezone matches', async () => {
		const guildRepo = makeGuildRepo({ timezone: 'Europe/Paris' });
		const controller = new ConfigTimezoneController(guildRepo);
		const result = await controller.prepare({ guildId: 'g1', value: 'Europe/Paris' });
		expect(result).toMatchObject({ status: 'warning', code: 'already-set' });
	});

	it('apply updates existing guild and returns success key', async () => {
		const guildRepo = makeGuildRepo({ timezone: 'UTC' });
		const controller = new ConfigTimezoneController(guildRepo, { defaultAnnouncementMessage: 'd' });
		const applied = await controller.apply({ guildId: 'g1', timezone: 'Europe/Paris', label: 'Europe/Paris (CET)' });
		expect(guildRepo.update).toHaveBeenCalledWith('g1', expect.objectContaining({ timezone: 'Europe/Paris' }));
		expect(applied.key).toBe(LanguageKeys.Commands.Config.SubcommandTimezoneResponseUpdated);
		expect(applied.args).toEqual({ timezone: 'Europe/Paris (CET)' });
	});
});

describe('ConfigLanguageController', () => {
	it('resolves label key based on language code', () => {
		const guildRepo = makeGuildRepo();
		const controller = new ConfigLanguageController(guildRepo);
		expect(controller.resolveLabelKey('fr')).toBe(LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR);
		expect(controller.resolveLabelKey('en-US')).toBe(LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS);
	});

	it('apply persists language and returns translated label arg', async () => {
		const guildRepo = makeGuildRepo({ language: 'en-US' });
		const controller = new ConfigLanguageController(guildRepo);
		const applied = await controller.apply({ guildId: 'g1', language: 'fr', languageLabel: 'Français' });
		expect(guildRepo.update).toHaveBeenCalledWith('g1', expect.objectContaining({ language: 'fr' }));
		expect(applied.args).toEqual({ language: 'Français' });
	});
});

describe('ConfigViewController', () => {
	it('falls back to defaults when no guild is stored', async () => {
		const guildRepo = makeGuildRepo(null);
		const controller = new ConfigViewController(guildRepo);
		const result = await controller.execute({ guildId: 'g1' });
		expect(result.data.guild).toBeNull();
		expect(result.data.timezone).toBe('Europe/London');
		expect(result.data.language).toBe('en-US');
		expect(result.data.overviewSort).toBe('month');
	});

	it('returns guild values when available', async () => {
		const guild = { timezone: 'Europe/Paris', language: 'fr', overviewSort: 'upcoming' };
		const guildRepo = makeGuildRepo(guild);
		const controller = new ConfigViewController(guildRepo);
		const result = await controller.execute({ guildId: 'g1' });
		expect(result.data.timezone).toBe('Europe/Paris');
		expect(result.data.language).toBe('fr');
		expect(result.data.overviewSort).toBe('upcoming');
	});
});

describe('ConfigOverviewSortController', () => {
	it('saves sort then invokes the refresh port in order', async () => {
		const guildRepo = makeGuildRepo({ overviewSort: 'month' });
		const refresh = vi.fn(async () => undefined);
		const controller = new ConfigOverviewSortController(guildRepo, { refreshOverviewMessage: refresh });
		await controller.apply({ guildId: 'g1', sort: 'upcoming', modeLabel: 'Upcoming' });
		expect(guildRepo.update).toHaveBeenCalledWith('g1', expect.objectContaining({ overviewSort: 'upcoming' }));
		expect(refresh).toHaveBeenCalledWith('g1');
		expect(guildRepo.update.mock.invocationCallOrder[0]).toBeLessThan(refresh.mock.invocationCallOrder[0]);
	});

	it('normalize maps unknown values to month', () => {
		const guildRepo = makeGuildRepo();
		const controller = new ConfigOverviewSortController(guildRepo);
		expect(controller.normalize('garbage')).toBe('month');
		expect(controller.normalize('upcoming')).toBe('upcoming');
	});
});
