export class Birthday {
	public readonly id: bigint;
	public readonly userId: string;
	public readonly guildId: string;
	/** Stored as "MM-DD" or "MM-DD-YYYY". */
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
		return this.birthday.slice(0, 5) === nowMonthDay && this.isActive();
	}

	public getMonth(): number {
		return this.parseBirthday()?.month ?? NaN;
	}

	public getDay(): number {
		return this.parseBirthday()?.day ?? NaN;
	}

	public getYear(): number | null {
		return this.parseBirthday()?.year ?? null;
	}

	public hasYear(): boolean {
		return this.getYear() !== null;
	}

	private parseBirthday(): { month: number; day: number; year: number | null } | null {
		const parts = this.birthday.split('-');
		if (parts.length < 2 || parts.length > 3) return null;

		const month = Number(parts[0]);
		const day = Number(parts[1]);
		const year = parts.length === 3 ? Number(parts[2]) : null;

		if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
		if (year !== null && !Number.isInteger(year)) return null;

		return { month, day, year };
	}
}
