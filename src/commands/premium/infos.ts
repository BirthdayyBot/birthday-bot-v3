import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { CdnUrls, Emojis, resolveEmoji } from '#utils/constants';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const PREMIUM_COLOR = 0xf1c40f;

@ApplyOptions<Command.Options>({
	name: 'premium-infos',
	description: 'View your premium subscription status',
	preconditions: ['UserIsPatreon'],
	registerSubCommand: {
		parentCommandName: 'premium',
		slashSubcommand: (sub) => sub.setName('infos').setDescription('View your premium subscription status')
	}
})
export class PremiumInfosSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const userId = interaction.user.id;
		const user = (await this.container.user.findById(userId))!;

		const grants = await this.container.premium.findByUserId(userId);
		const guildGrants = grants.filter((g) => g.isGuildGrant());
		const usedSlots = guildGrants.length;
		const maxSlots = user.patreonMaxSlots;
		const currentGuildId = interaction.guild?.id ?? null;
		const isActiveHere = currentGuildId !== null && guildGrants.some((g) => g.guildId === currentGuildId);

		const [title, activeLabel, serversCount, noActiveGuilds, tipDeactivate, patreonButton, manageButton] = await Promise.all([
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponseTitle),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponseActive),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponseServersCount, { used: usedSlots, max: maxSlots }),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponseNoActiveGuilds),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponseTipDeactivate),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponsePatreonButton),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandInfosResponseManageButton)
		]);

		const serverLines = await Promise.all(
			guildGrants.map(async (g) => {
				const guild = this.container.client.guilds.cache.get(g.guildId!);
				const name = guild?.name ?? g.guildId!;
				const isCurrent = g.guildId === currentGuildId;
				const key = isCurrent
					? LanguageKeys.Commands.Premium.SubcommandInfosResponseServerEntryCurrent
					: LanguageKeys.Commands.Premium.SubcommandInfosResponseServerEntry;
				return `• ${await resolveKey(interaction, key, { name, id: g.guildId! })}`;
			})
		);

		const serverBlock = guildGrants.length === 0 ? noActiveGuilds : serverLines.join('\n');
		const tip = isActiveHere ? `\n\n${tipDeactivate}` : '';

		const description = [`${resolveEmoji(Emojis.Heart)} **${activeLabel}**`, '', serversCount, serverBlock, tip].join('\n').trim();

		return interaction.reply({
			embeds: [new EmbedBuilder().setColor(PREMIUM_COLOR).setAuthor({ name: title, iconURL: CdnUrls.CupCake }).setDescription(description)],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setLabel(patreonButton).setStyle(ButtonStyle.Link).setURL('https://www.patreon.com/birthdayy'),
					new ButtonBuilder().setLabel(manageButton).setStyle(ButtonStyle.Link).setURL('https://www.patreon.com/billing')
				)
			],
			ephemeral: true
		});
	}
}
