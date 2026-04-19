export class User {
	public readonly userId: string;
	public readonly username: string | null;
	public readonly discriminator: string | null;
	public readonly premium: boolean;
	public readonly patreonMaxSlots: number;
	public readonly lastUpdated: Date;

	public constructor(props: {
		userId: string;
		username: string | null;
		discriminator: string | null;
		premium: boolean;
		patreonMaxSlots: number;
		lastUpdated: Date;
	}) {
		this.userId = props.userId;
		this.username = props.username;
		this.discriminator = props.discriminator;
		this.premium = props.premium;
		this.patreonMaxSlots = props.patreonMaxSlots;
		this.lastUpdated = props.lastUpdated;
	}

	public isPremium(): boolean {
		return this.premium;
	}

	public getDisplayName(): string {
		if (!this.username) return this.userId;
		if (this.discriminator && this.discriminator !== '0') return `${this.username}#${this.discriminator}`;
		return this.username;
	}
}
