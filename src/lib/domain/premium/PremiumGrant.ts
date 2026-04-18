export class PremiumGrant {
	public readonly id: number;
	public readonly userId: string;
	public readonly guildId: string | null;
	public readonly tier: boolean;

	public constructor(props: { id: number; userId: string; guildId: string | null; tier: boolean }) {
		this.id = props.id;
		this.userId = props.userId;
		this.guildId = props.guildId;
		this.tier = props.tier;
	}

	public isGuildGrant(): boolean {
		return this.guildId !== null;
	}

	public isUserGrant(): boolean {
		return this.guildId === null;
	}
}
