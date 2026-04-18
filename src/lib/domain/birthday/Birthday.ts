export class Birthday {
	public readonly id: bigint;
	public readonly userId: string;
	public readonly guildId: string;
	public readonly birthday: string;
	public readonly disabled: boolean;

	public constructor(props: { id: bigint; userId: string; guildId: string; birthday: string; disabled: boolean }) {
		this.id = props.id;
		this.userId = props.userId;
		this.guildId = props.guildId;
		this.birthday = props.birthday;
		this.disabled = props.disabled;
	}

	public isActive(): boolean {
		return !this.disabled;
	}

	public isToday(nowMonthDay: string): boolean {
		return this.birthday === nowMonthDay && this.isActive();
	}

	public getMonth(): number {
		return Number(this.birthday.split('-')[0]);
	}

	public getDay(): number {
		return Number(this.birthday.split('-')[1]);
	}
}
