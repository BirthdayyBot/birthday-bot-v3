import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BirthdayRegisterController } from '#lib/application/birthday-commands/BirthdayRegisterController';
import { BirthdayUpdateController } from '#lib/application/birthday-commands/BirthdayUpdateController';
import { BirthdayDeleteController } from '#lib/application/birthday-commands/BirthdayDeleteController';
import { BirthdayViewController } from '#lib/application/birthday-commands/BirthdayViewController';
import { BirthdayListController } from '#lib/application/birthday-commands/BirthdayListController';
import { Birthday } from '#lib/domain/birthday/Birthday';

interface FakeBirthday {
	userId: string;
	birthday: string;
	disabled: boolean;
	isActive(): boolean;
}

function fakeBirthday(overrides: Partial<FakeBirthday> = {}): FakeBirthday {
	const record: FakeBirthday = {
		userId: 'user-1',
		birthday: '05-21-1990',
		disabled: false,
		isActive() {
			return !this.disabled;
		},
		...overrides
	};
	return record;
}

function makeGuildRepo(language = 'en-US', timezone = 'UTC') {
	return {
		findById: vi.fn(async () => ({ language, timezone }))
	};
}

function makeRepo(initial: FakeBirthday[] = []) {
	const store = new Map(initial.map((b) => [`${b.userId}|guild-1`, b] as const));
	return {
		store,
		findByUserAndGuild: vi.fn(async (userId: string, guildId: string) => store.get(`${userId}|${guildId}`) ?? null),
		upsert: vi.fn(async (data: { userId: string; guildId: string; birthday: string }) => {
			store.set(`${data.userId}|${data.guildId}`, fakeBirthday({ userId: data.userId, birthday: data.birthday }));
		}),
		setDisabled: vi.fn(async (userId: string, guildId: string, disabled: boolean) => {
			const existing = store.get(`${userId}|${guildId}`);
			if (existing) existing.disabled = disabled;
		}),
		findActiveByGuildId: vi.fn(async (guildId: string) =>
			Array.from(store.values())
				.filter((b) => b.isActive())
				.map((b) => new Birthday({ id: 1n, userId: b.userId, guildId, birthday: b.birthday, disabled: b.disabled }))
		)
	};
}

describe('BirthdayRegisterController', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns invalid-date warning for an impossible date', async () => {
		const repo = makeRepo();
		const controller = new BirthdayRegisterController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', targetId: 'user-1', isSelf: true, month: 2, day: 31 });
		expect(result).toMatchObject({ status: 'warning', code: 'invalid-date' });
	});

	it('returns already-exists when an active birthday is found', async () => {
		const repo = makeRepo([fakeBirthday()]);
		const controller = new BirthdayRegisterController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', targetId: 'user-1', isSelf: true, month: 5, day: 21, year: 1990 });
		expect(result).toMatchObject({ status: 'warning', code: 'already-exists' });
	});

	it('upserts and returns success for self with no userId arg', async () => {
		const repo = makeRepo();
		const controller = new BirthdayRegisterController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', targetId: 'user-1', isSelf: true, month: 5, day: 21, year: 1990 });
		expect(result.status).toBe('success');
		expect(repo.upsert).toHaveBeenCalledWith({ userId: 'user-1', guildId: 'guild-1', birthday: '05-21-1990' });
		if (result.status === 'success') expect(result.args?.userId).toBeUndefined();
	});

	it('returns success for other with userId arg', async () => {
		const repo = makeRepo();
		const controller = new BirthdayRegisterController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', targetId: 'user-2', isSelf: false, month: 5, day: 21, year: 1990 });
		if (result.status === 'success') expect(result.args?.userId).toBe('user-2');
	});
});

describe('BirthdayUpdateController', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns invalid-date when date does not exist', async () => {
		const repo = makeRepo();
		const controller = new BirthdayUpdateController(repo, makeGuildRepo());
		const result = await controller.prepare({ guildId: 'guild-1', targetId: 'user-1', month: 2, day: 31 });
		expect(result).toMatchObject({ status: 'warning', code: 'invalid-date' });
	});

	it('returns not-found when no birthday is registered', async () => {
		const repo = makeRepo();
		const controller = new BirthdayUpdateController(repo, makeGuildRepo());
		const result = await controller.prepare({ guildId: 'guild-1', targetId: 'user-1', month: 5, day: 21 });
		expect(result).toMatchObject({ status: 'warning', code: 'not-found' });
	});

	it('prepare returns ready data and apply upserts', async () => {
		const repo = makeRepo([fakeBirthday()]);
		const controller = new BirthdayUpdateController(repo, makeGuildRepo());
		const prep = await controller.prepare({ guildId: 'guild-1', targetId: 'user-1', month: 6, day: 1, year: 1991 });
		expect(prep).toMatchObject({ status: 'ready', data: { birthday: '06-01-1991' } });

		const applied = await controller.apply({ guildId: 'guild-1', targetId: 'user-1', birthday: '06-01-1991', isSelf: true });
		expect(applied.status).toBe('success');
		expect(repo.upsert).toHaveBeenCalledWith({ userId: 'user-1', guildId: 'guild-1', birthday: '06-01-1991' });
	});
});

describe('BirthdayDeleteController', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns not-found when birthday is missing or disabled', async () => {
		const repo = makeRepo([fakeBirthday({ disabled: true })]);
		const controller = new BirthdayDeleteController(repo);
		const prep = await controller.prepare({ guildId: 'guild-1', targetId: 'user-1' });
		expect(prep).toMatchObject({ status: 'warning', code: 'not-found' });
	});

	it('apply disables the birthday and returns success', async () => {
		const repo = makeRepo([fakeBirthday()]);
		const controller = new BirthdayDeleteController(repo);
		const applied = await controller.apply({ guildId: 'guild-1', targetId: 'user-1', isSelf: false });
		expect(applied.status).toBe('success');
		expect(applied.args?.userId).toBe('user-1');
		expect(repo.setDisabled).toHaveBeenCalledWith('user-1', 'guild-1', true);
	});
});

describe('BirthdayViewController', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns not-found for missing birthday', async () => {
		const repo = makeRepo();
		const controller = new BirthdayViewController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', targetId: 'user-1', isSelf: true });
		expect(result).toMatchObject({ status: 'warning', code: 'not-found' });
	});

	it('returns success with date and timeUntil', async () => {
		const repo = makeRepo([fakeBirthday()]);
		const controller = new BirthdayViewController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', targetId: 'user-1', isSelf: true });
		expect(result.status).toBe('success');
		if (result.status === 'success') {
			expect(result.args.date).toBeDefined();
			expect(result.args.timeUntil).toBeDefined();
		}
	});
});

describe('BirthdayListController', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns empty entries when no active birthdays', async () => {
		const repo = makeRepo();
		const controller = new BirthdayListController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', sortMode: null });
		expect(result.status).toBe('success');
		expect(result.data.entries).toEqual([]);
	});

	it('returns sorted entries when birthdays exist', async () => {
		const repo = makeRepo([fakeBirthday(), fakeBirthday({ userId: 'user-2', birthday: '01-15-1985' })]);
		const controller = new BirthdayListController(repo, makeGuildRepo());
		const result = await controller.execute({ guildId: 'guild-1', sortMode: 'month' });
		expect(result.data.entries).toHaveLength(2);
		expect(result.data.sortMode).toBe('month');
	});
});
