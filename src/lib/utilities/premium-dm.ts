import { container } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const PREMIUM_COLOR = 0xf6c90e;

export async function sendPremiumGrantDM(
	userId: string,
	slots: number,
	tier: string,
	expiresAt: Date | null,
	durationLabel?: string | null
): Promise<void> {
	try {
		const user = await container.client.users.fetch(userId);
		const dm = await user.createDM();

		const durationLine = `\n*Votre abonnement est valable ${durationLabel ?? 'à vie'}.*\n`;

		const embed = new EmbedBuilder()
			.setColor(PREMIUM_COLOR)
			.setDescription(
				`Votre abonnement **${tier}** a été activé avec succès ! 🎉\n` +
					`Découvrez nos fonctionnalités premium en l'activant sur **${slots} serveur${slots > 1 ? 's' : ''}**, via la commande \`/premium activate\` ou depuis le panel !` +
					`${durationLine}\n` +
					`Merci pour votre soutien ! ❤️`
			);

		const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setLabel('Gérer mon Premium').setStyle(ButtonStyle.Link).setURL('https://www.patreon.com/billing')
		);

		await dm.send({ content: `Hey ${user} 👋`, embeds: [embed], components: [button] });
	} catch {
		// User may have DMs disabled — silently ignore
	}
}

export async function sendPremiumRevokedDM(userId: string): Promise<void> {
	try {
		const user = await container.client.users.fetch(userId);
		const dm = await user.createDM();

		const embed = new EmbedBuilder()
			.setColor(0xed4245)
			.setDescription('Votre abonnement premium **Birthdayy** a pris fin. Merci pour votre soutien ! 🙏');

		await dm.send({ embeds: [embed] });
	} catch {
		// User may have DMs disabled — silently ignore
	}
}
