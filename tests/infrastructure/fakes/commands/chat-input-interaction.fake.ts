import { vi } from 'vitest';

export function createFakeChatInputInteraction(sortValue: string) {
	const editReply = vi.fn().mockResolvedValue(undefined);
	return {
		interaction: {
			options: {
				getString: vi.fn().mockReturnValue(sortValue)
			},
			user: { id: 'user-1' },
			editReply
		},
		editReply
	};
}
