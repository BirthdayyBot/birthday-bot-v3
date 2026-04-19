export type SubscriptionSource = 'patreon' | 'gift';

export class SubscriptionHistory {
	public readonly id: number;
	public readonly userId: string;
	public readonly tier: string;
	public readonly slots: number;
	public readonly source: SubscriptionSource;
	public readonly startedAt: Date;
	public readonly endedAt: Date | null;

	public constructor(props: {
		id: number;
		userId: string;
		tier: string;
		slots: number;
		source: SubscriptionSource;
		startedAt: Date;
		endedAt: Date | null;
	}) {
		this.id = props.id;
		this.userId = props.userId;
		this.tier = props.tier;
		this.slots = props.slots;
		this.source = props.source;
		this.startedAt = props.startedAt;
		this.endedAt = props.endedAt;
	}

	public isActive(): boolean {
		return this.endedAt === null;
	}
}
