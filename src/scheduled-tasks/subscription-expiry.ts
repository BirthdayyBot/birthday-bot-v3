import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

export class SubscriptionExpiryTask extends ScheduledTask<'subscriptionExpiry'> {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			name: 'subscriptionExpiry',
			pattern: '0 * * * *'
		});
	}

	public override async run() {
		const expired = await this.container.subscriptionHistory.findExpired();
		for (const sub of expired) {
			await this.container.subscriptionHistory.end(sub.userId);
			await this.container.premium.removeUserGrantByUserId(sub.userId);

			const remainingGrants = await this.container.premium.findByUserId(sub.userId);
			if (remainingGrants.length === 0) {
				await this.container.user.setPremium(sub.userId, false);
				await this.container.user.setPatreonSlots(sub.userId, 0);
			}
		}
	}
}
