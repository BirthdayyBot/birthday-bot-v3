import { EXPIRATION_TIMES, SUBSCRIPTION_TIERS } from '#lib/util/constants';
import { replySuccess } from '#lib/utilities/default-embed';
import { sendPremiumGrantDM } from '#lib/utilities/premium-dm';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
	name: 'admin-premium-gift',
	description: 'Gift premium to a user',
	preconditions: ['OwnerOnly'],
	registerSubCommand: {
		parentCommandName: 'admin',
		slashSubcommand: (sub) =>
			sub
				.setName('premium-gift')
				.setDescription('Gift premium to a user (owner only)')
				.addUserOption((option) => option.setName('user').setDescription('The Discord user to gift premium to').setRequired(true))
				.addStringOption((option) =>
					option
						.setName('tier')
						.setDescription('The premium tier to gift')
						.setRequired(true)
						.addChoices(
							{ name: 'Birthdayy Premium (1 server)', value: 'premium' },
							{ name: 'Super Supporter (3 servers)', value: 'super_supporter' }
						)
				)
				.addStringOption((option) =>
					option
						.setName('duration')
						.setDescription('How long the gift lasts.')
						.setRequired(true)
						.addChoices(
							{ name: 'Permanent', value: 'permanent' },
							{ name: '7 days', value: '7d' },
							{ name: '15 days', value: '15d' },
							{ name: '1 month', value: '1m' },
							{ name: '3 months', value: '3m' },
							{ name: '6 months', value: '6m' },
							{ name: '1 year', value: '1y' }
						)
				)
	}
})
export class AdminPremiumGiftSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = interaction.options.getUser('user', true);
		const tierKey = interaction.options.getString('tier', true);
		const durationKey = interaction.options.getString('duration', true);
		const { slots, label } = SUBSCRIPTION_TIERS[tierKey] ?? { slots: 1, label: 'Birthdayy Premium' };

		const duration = EXPIRATION_TIMES[durationKey];
		const expiresAt = duration.ms === null ? null : new Date(Date.now() + duration.ms);

		await this.container.user.upsert({ userId: target.id, username: target.username, lastUpdated: new Date() });
		await this.container.user.setPremium(target.id, true);
		await this.container.user.setPatreonSlots(target.id, slots);

		const existing = await this.container.premium.findByUserId(target.id);
		if (!existing.some((g) => g.isUserGrant())) {
			await this.container.premium.add({ userId: target.id });
		}

		await this.container.subscriptionHistory.end(target.id);
		await this.container.subscriptionHistory.start({ userId: target.id, tier: label, slots, source: 'gift', expiresAt });
		await sendPremiumGrantDM(target.id, slots, label, duration?.label);

		const expiry = expiresAt ? ` (expires <t:${Math.floor(expiresAt.getTime() / 1000)}:D>)` : ' (permanent)';
		return interaction.reply(replySuccess(`Gifted **${slots} premium slot${slots > 1 ? 's' : ''}** to ${target}${expiry}.`, interaction.user));
	}
}
