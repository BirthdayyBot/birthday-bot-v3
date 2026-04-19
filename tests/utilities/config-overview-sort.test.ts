import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeChatInputInteraction } from '../infrastructure/fakes/commands/chat-input-interaction.fake';

const getGuildIdOrReplyMock = vi.fn();
const saveGuildConfigMock = vi.fn();
const awaitConfirmationMock = vi.fn();
const upsertBirthdayOverviewMessageMock = vi.fn();
const resolveKeyMock = vi.fn();

vi.mock('@sapphire/decorators', () => ({
	ApplyOptions: () => (target: unknown) => target
}));

vi.mock('@kaname-png/plugin-subcommands-advanced', () => ({
	Command: class {}
}));

vi.mock('@sapphire/plugin-i18next', () => ({
	applyDescriptionLocalizedBuilder: (value: unknown) => value,
	createLocalizedChoice: (_key: unknown, value: { value: string }) => value,
	resolveKey: (...args: unknown[]) => resolveKeyMock(...args)
}));

vi.mock('../../src/lib/utilities/config-command', () => ({
	getGuildIdOrReply: (...args: unknown[]) => getGuildIdOrReplyMock(...args),
	saveGuildConfig: (...args: unknown[]) => saveGuildConfigMock(...args)
}));

vi.mock('../../src/lib/utilities/confirm', () => ({
	awaitConfirmation: (...args: unknown[]) => awaitConfirmationMock(...args)
}));

vi.mock('../../src/lib/utilities/default-embed', () => ({
	editReplyInfo: (description: string) => ({ description, tone: 'info' }),
	editReplySuccess: (description: string) => ({ description, tone: 'success' })
}));

vi.mock('../../src/lib/utilities/overview-message', () => ({
	upsertBirthdayOverviewMessage: (...args: unknown[]) => upsertBirthdayOverviewMessageMock(...args)
}));

describe('config overview-sort integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getGuildIdOrReplyMock.mockResolvedValue('guild-1');
		awaitConfirmationMock.mockResolvedValue(true);
		saveGuildConfigMock.mockResolvedValue(undefined);
		upsertBirthdayOverviewMessageMock.mockResolvedValue(undefined);
		resolveKeyMock.mockResolvedValue('localized-text');
	});

	const fakeContext = { container: { guild: {} } };

	it('saves sort mode then refreshes overview message', async () => {
		const { ConfigOverviewSortSubcommand } = await import('../../src/commands/config/overview-sort');
		const { interaction, editReply } = createFakeChatInputInteraction('upcoming');

		await ConfigOverviewSortSubcommand.prototype.chatInputRun.call(fakeContext as any, interaction);

		expect(saveGuildConfigMock).toHaveBeenCalledWith(expect.anything(), 'guild-1', { overviewSort: 'upcoming' }, 'localized-text');
		expect(upsertBirthdayOverviewMessageMock).toHaveBeenCalledWith('guild-1');
		expect(saveGuildConfigMock.mock.invocationCallOrder[0]).toBeLessThan(upsertBirthdayOverviewMessageMock.mock.invocationCallOrder[0]);
		expect(editReply).toHaveBeenCalledTimes(1);
	});

	it('normalizes unexpected sort value to month before saving', async () => {
		const { ConfigOverviewSortSubcommand } = await import('../../src/commands/config/overview-sort');
		const { interaction } = createFakeChatInputInteraction('unexpected-sort');

		await ConfigOverviewSortSubcommand.prototype.chatInputRun.call(fakeContext as any, interaction);

		expect(saveGuildConfigMock).toHaveBeenCalledWith(expect.anything(), 'guild-1', { overviewSort: 'month' }, 'localized-text');
		expect(upsertBirthdayOverviewMessageMock).toHaveBeenCalledWith('guild-1');
	});

	it('does not save or refresh when confirmation is cancelled', async () => {
		awaitConfirmationMock.mockResolvedValueOnce(false);

		const { ConfigOverviewSortSubcommand } = await import('../../src/commands/config/overview-sort');
		const { interaction, editReply } = createFakeChatInputInteraction('upcoming');

		await ConfigOverviewSortSubcommand.prototype.chatInputRun.call(fakeContext as any, interaction);

		expect(saveGuildConfigMock).not.toHaveBeenCalled();
		expect(upsertBirthdayOverviewMessageMock).not.toHaveBeenCalled();
		expect(editReply).toHaveBeenCalledTimes(1);
	});
});
