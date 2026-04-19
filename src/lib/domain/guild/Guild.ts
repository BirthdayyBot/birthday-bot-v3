export class Guild {
	public readonly guildId: string;
	public readonly inviter: string | null;
	public readonly announcementChannel: string | null;
	public readonly announcementMessage: string;
	public readonly overviewChannel: string | null;
	public readonly overviewMessage: string | null;
	public readonly overviewSort: string;
	public readonly birthdayRole: string | null;
	public readonly birthdayPingRole: string | null;
	public readonly logChannel: string | null;
	public readonly timezone: string;
	public readonly announcementHour: number;
	public readonly premium: boolean;
	public readonly language: string;
	public readonly lastUpdated: Date | null;
	public readonly disabled: boolean;

	public constructor(props: {
		guildId: string;
		inviter: string | null;
		announcementChannel: string | null;
		announcementMessage: string;
		overviewChannel: string | null;
		overviewMessage: string | null;
		overviewSort: string;
		birthdayRole: string | null;
		birthdayPingRole: string | null;
		logChannel: string | null;
		timezone: string;
		announcementHour: number;
		premium: boolean;
		language: string;
		lastUpdated: Date | null;
		disabled: boolean;
	}) {
		this.guildId = props.guildId;
		this.inviter = props.inviter;
		this.announcementChannel = props.announcementChannel;
		this.announcementMessage = props.announcementMessage;
		this.overviewChannel = props.overviewChannel;
		this.overviewMessage = props.overviewMessage;
		this.overviewSort = props.overviewSort;
		this.birthdayRole = props.birthdayRole;
		this.birthdayPingRole = props.birthdayPingRole;
		this.logChannel = props.logChannel;
		this.timezone = props.timezone;
		this.announcementHour = props.announcementHour;
		this.premium = props.premium;
		this.language = props.language;
		this.lastUpdated = props.lastUpdated;
		this.disabled = props.disabled;
	}

	public hasAnnouncementChannel(): boolean {
		return this.announcementChannel !== null;
	}

	public hasOverviewChannel(): boolean {
		return this.overviewChannel !== null;
	}

	public hasBirthdayRole(): boolean {
		return this.birthdayRole !== null;
	}

	public hasBirthdayPingRole(): boolean {
		return this.birthdayPingRole !== null;
	}

	public hasLogChannel(): boolean {
		return this.logChannel !== null;
	}

	public isPremium(): boolean {
		return this.premium;
	}

	public isActive(): boolean {
		return !this.disabled;
	}
}
