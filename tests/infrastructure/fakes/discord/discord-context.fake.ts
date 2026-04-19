import { vi } from 'vitest';

export function createFakeOverviewEmbedFactory() {
	return vi.fn((description: string, tone: string) => ({
		description,
		tone,
		title: '',
		setTitle(title: string) {
			this.title = title;
			return this;
		}
	}));
}

export function createFakeDiscordContext(overrides?: { existingMessage?: { edit: ReturnType<typeof vi.fn> } | null; sendResultId?: string }) {
	const send = vi.fn().mockResolvedValue({ id: overrides?.sendResultId ?? 'sent-message-id' });
	const messagesFetch = vi.fn().mockResolvedValue(overrides?.existingMessage ?? null);
	const channel = {
		isTextBased: () => true,
		send,
		messages: {
			fetch: messagesFetch
		}
	};
	const channelsFetch = vi.fn().mockResolvedValue(channel);
	const guild = {
		channels: {
			fetch: channelsFetch
		}
	};

	return { send, messagesFetch, channelsFetch, channel, guild };
}
