import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, type ChatInputCommandInteraction } from 'discord.js';
import { createDefaultEmbed } from '#lib/utilities/default-embed';

export interface ConfirmationOptions {
	tone?: 'success' | 'error' | 'warning' | 'info';
	yesLabel?: string;
	noLabel?: string;
	time?: number;
}

export async function awaitConfirmation(
	interaction: ChatInputCommandInteraction,
	question: string,
	options: ConfirmationOptions = {}
): Promise<boolean> {
	const { tone = 'info', yesLabel = 'Yes', noLabel = 'No', time = 30_000 } = options;

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId('confirm_yes').setLabel(yesLabel).setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId('confirm_no').setLabel(noLabel).setStyle(ButtonStyle.Danger)
	);

	await interaction.reply({
		embeds: [createDefaultEmbed(question, tone)],
		components: [row],
		ephemeral: true,
		allowedMentions: { users: [interaction.user.id], roles: [] }
	});

	const response = await interaction.fetchReply();

	try {
		const btn = await response.awaitMessageComponent({
			componentType: ComponentType.Button,
			filter: (i) => i.user.id === interaction.user.id,
			time
		});
		await btn.update({ components: [] });
		return btn.customId === 'confirm_yes';
	} catch {
		await interaction.editReply({ components: [] });
		return false;
	}
}
