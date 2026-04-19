import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

export class BirthdayRoleResetTask extends ScheduledTask<'birthdayRoleReset'> {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			name: 'birthdayRoleReset'
		});
	}

	public override async run(payload: { guildId: string; userId: string; roleId: string; dateKey: string }) {
		const guild = await this.container.client.guilds.fetch(payload.guildId).catch(() => null);
		if (!guild) return;

		const member = await guild.members.fetch(payload.userId).catch(() => null);
		if (!member || !member.roles.cache.has(payload.roleId)) return;

		await member.roles.remove(payload.roleId).catch(() => null);
	}
}
