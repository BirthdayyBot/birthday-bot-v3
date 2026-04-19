import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { CdnUrls, Emojis, resolveEmoji } from '#utils/constants';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const PREMIUM_COLOR = 0xf1c40f;
const ERROR_COLOR = 0xed4245;

@ApplyOptions<Command.Options>({
	name: 'premium-activate',
	description: 'Activate premium on this server',
	preconditions: ['GuildOnly', 'UserIsPatreon'],
	registerSubCommand: {
		parentCommandName: 'premium',
		slashSubcommand: (sub) => sub.setName('activate').setDescription('Activate premium on this server')
	}
})
export class PremiumActivateSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = interaction.guildId!;
		const userId = interaction.user.id;
		const user = (await this.container.user.findById(userId))!;

		const [existing, usedSlots] = await Promise.all([
			this.container.premium.findByUserAndGuild(userId, guildId),
			this.container.premium.countGuildGrantsByUserId(userId)
		]);

		if (existing) {
			const msg = await resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandActivateResponseAlreadyActive);
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription(`${resolveEmoji(Emojis.Warning)} ${msg}`)],
				ephemeral: true
			});
		}

		if (usedSlots >= user.patreonMaxSlots) {
			const msg = await resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandActivateResponseNoSlots, {
				used: usedSlots,
				max: user.patreonMaxSlots
			});
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription(`${resolveEmoji(Emojis.Warning)} ${msg}`)],
				ephemeral: true
			});
		}

		await this.container.premium.add({ userId, guildId });
		await this.container.guild.update(guildId, { premium: true });

		const newUsed = usedSlots + 1;
		const guildName = interaction.guild?.name ?? guildId;
		const grants = await this.container.premium.findByUserId(userId);
		const guildGrants = grants.filter((g) => g.isGuildGrant());

		const serverLines = guildGrants
			.map((g) => {
				const guild = this.container.client.guilds.cache.get(g.guildId!);
				const name = guild?.name ?? g.guildId!;
				const isCurrent = g.guildId === guildId;
				return `• **${name}** (\`${g.guildId}\`)${isCurrent ? ' *(Ce serveur)*' : ''}`;
			})
			.join('\n');

		const [title, description, serversCount, manageButton] = await Promise.all([
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandActivateResponseTitle),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandActivateResponseDescription, { name: guildName }),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandActivateResponseServersCount, {
				used: newUsed,
				max: user.patreonMaxSlots
			}),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandActivateResponseManageButton)
		]);

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(PREMIUM_COLOR)
					.setAuthor({ name: title, iconURL: CdnUrls.CupCake })
					.setDescription(`${resolveEmoji(Emojis.Success)} ${description}\n\n${serversCount}\n${serverLines}`)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setLabel(manageButton).setStyle(ButtonStyle.Link).setURL('https://www.patreon.com/billing')
				)
			],
			ephemeral: true
		});
	}
}
