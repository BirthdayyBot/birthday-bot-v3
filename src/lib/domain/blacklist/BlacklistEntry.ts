export class BlacklistEntry {
	public readonly id: bigint;
	public readonly guildId: string;
	public readonly userId: string;
	public readonly addedAt: Date;
	public readonly disabled: boolean;

	public constructor(props: { id: bigint; guildId: string; userId: string; addedAt: Date; disabled: boolean }) {
		this.id = props.id;
		this.guildId = props.guildId;
		this.userId = props.userId;
		this.addedAt = props.addedAt;
		this.disabled = props.disabled;
	}

	public isActive(): boolean {
		return !this.disabled;
	}
}
