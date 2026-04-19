import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { Time } from '@sapphire/time-utilities';
import { replySuccess } from '#lib/utilities/default-embed';
import { sendPremiumGrantDM } from '#lib/utilities/premium-dm';

const TIER_SLOTS: Record<string, { slots: number; label: string }> = {
	premium: { slots: 1, label: 'Birthdayy Premium' },
	super_supporter: { slots: 3, label: 'Super Supporter' }
};

const DURATIONS: Record<string, { ms: number | null; label: string }> = {
	permanent: { ms: null, label: 'à vie' },
	'7d': { ms: Time.Day * 7, label: '7 jours' },
	'15d': { ms: Time.Day * 15, label: '15 jours' },
	'1m': { ms: Time.Day * 30, label: 'un mois' },
	'3m': { ms: Time.Day * 90, label: '3 mois' },
	'6m': { ms: Time.Day * 180, label: '6 mois' },
	'1y': { ms: Time.Day * 365, label: 'un an' }
};

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
		const { slots, label } = TIER_SLOTS[tierKey] ?? { slots: 1, label: 'Birthdayy Premium' };

		const duration = DURATIONS[durationKey];
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
		await sendPremiumGrantDM(target.id, slots, label, expiresAt, duration?.label);

		const expiry = expiresAt ? ` (expires <t:${Math.floor(expiresAt.getTime() / 1000)}:D>)` : ' (permanent)';
		return interaction.reply(replySuccess(`Gifted **${slots} premium slot${slots > 1 ? 's' : ''}** to ${target}${expiry}.`, interaction.user));
	}
}
