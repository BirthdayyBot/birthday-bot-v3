import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { replySuccess } from '#lib/utilities/default-embed';

const TIER_SLOTS: Record<string, { slots: number; label: string }> = {
	premium: { slots: 1, label: 'Birthdayy Premium' },
	super_supporter: { slots: 3, label: 'Super Supporter' }
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
	}
})
export class AdminPremiumGiftSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = interaction.options.getUser('user', true);
		const tierKey = interaction.options.getString('tier', true);
		const { slots, label } = TIER_SLOTS[tierKey] ?? { slots: 1, label: 'Birthdayy Premium' };

		await this.container.user.upsert({ userId: target.id, username: target.username, lastUpdated: new Date() });
		await this.container.user.setPremium(target.id, true);
		await this.container.user.setPatreonSlots(target.id, slots);

		const existing = await this.container.premium.findByUserId(target.id);
		if (!existing.some((g) => g.isUserGrant())) {
			await this.container.premium.add({ userId: target.id });
		}

		// End any currently active subscription before starting a new gifted one
		await this.container.subscriptionHistory.end(target.id);
		await this.container.subscriptionHistory.start({ userId: target.id, tier: label, slots, source: 'gift' });

		return interaction.reply(replySuccess(`Gifted **${slots} premium slot${slots > 1 ? 's' : ''}** to ${target}.`, interaction.user));
	}
}
