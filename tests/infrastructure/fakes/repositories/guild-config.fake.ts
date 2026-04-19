export interface FakeGuildConfig {
	overviewChannel: string | null;
	overviewMessage: string | null;
	overviewSort: string;
	timezone: string;
	language: string;
	isActive: () => boolean;
	hasOverviewChannel: () => boolean;
}

export function createFakeGuildConfig(overrides: Partial<FakeGuildConfig> = {}): FakeGuildConfig {
	return {
		overviewChannel: 'channel-1',
		overviewMessage: null,
		overviewSort: 'month',
		timezone: 'UTC',
		language: 'en-US',
		isActive: () => true,
		hasOverviewChannel: () => true,
		...overrides
	};
}