import { describe, expect, it } from 'vitest';
import { User } from '#lib/domain/user/User';

function createUser(overrides: Partial<ConstructorParameters<typeof User>[0]> = {}): User {
	return new User({
		userId: '999999999999',
		username: 'alice',
		discriminator: '1234',
		premium: false,
		lastUpdated: new Date('2026-01-01T00:00:00.000Z'),
		...overrides
	});
}

describe('User', () => {
	it('reports premium status', () => {
		expect(createUser({ premium: true }).isPremium()).toBe(true);
		expect(createUser({ premium: false }).isPremium()).toBe(false);
	});

	it('builds display name with legacy discriminator', () => {
		const user = createUser({ username: 'alice', discriminator: '1234' });
		expect(user.getDisplayName()).toBe('alice#1234');
	});

	it('returns username when discriminator is 0', () => {
		const user = createUser({ username: 'alice', discriminator: '0' });
		expect(user.getDisplayName()).toBe('alice');
	});

	it('falls back to user id when username is missing', () => {
		const user = createUser({ username: null, discriminator: null });
		expect(user.getDisplayName()).toBe('999999999999');
	});
});