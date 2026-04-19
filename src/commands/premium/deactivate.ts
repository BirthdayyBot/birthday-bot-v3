import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { CdnUrls, Emojis, resolveEmoji } from '#utils/constants';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const PREMIUM_COLOR = 0xf1c40f;
const ERROR_COLOR = 0xed4245;

@ApplyOptions<Command.Options>({
	name: 'premium-deactivate',
	description: 'Deactivate premium on this server',
	preconditions: ['GuildOnly'],
	registerSubCommand: {
		parentCommandName: 'premium',
		slashSubcommand: (sub) => sub.setName('deactivate').setDescription('Deactivate premium on this server')
	}
})
export class PremiumDeactivateSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = interaction.guildId!;

		const userId = interaction.user.id;
		const [existing, user] = await Promise.all([
			this.container.premium.findByUserAndGuild(userId, guildId),
			this.container.user.findById(userId)
		]);

		if (!existing) {
			const msg = await resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandDeactivateResponseNotActive);
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription(`${resolveEmoji(Emojis.Warning)} ${msg}`)],
				ephemeral: true
			});
		}

		await this.container.premium.removeByUserAndGuild(userId, guildId);
		const remainingGrant = await this.container.premium.findByGuildId(guildId);
		if (!remainingGrant) await this.container.guild.update(guildId, { premium: false });

		const maxSlots = user?.patreonMaxSlots ?? 1;
		const guildName = interaction.guild?.name ?? guildId;
		const grants = await this.container.premium.findByUserId(userId);
		const guildGrants = grants.filter((g) => g.isGuildGrant());
		const newUsed = guildGrants.length;

		const serverLines =
			guildGrants.length === 0
				? await resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandDeactivateResponseNoActiveGuilds)
				: guildGrants
						.map((g) => {
							const guild = this.container.client.guilds.cache.get(g.guildId!);
							const name = guild?.name ?? g.guildId!;
							return `• **${name}** (\`${g.guildId}\`)`;
						})
						.join('\n');

		const [title, description, serversCount, manageButton] = await Promise.all([
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandDeactivateResponseTitle),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandDeactivateResponseDescription, { name: guildName }),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandDeactivateResponseServersCount, { used: newUsed, max: maxSlots }),
			resolveKey(interaction, LanguageKeys.Commands.Premium.SubcommandDeactivateResponseManageButton)
		]);

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(PREMIUM_COLOR)
					.setAuthor({ name: title, iconURL: CdnUrls.CupCake })
					.setDescription(`${resolveEmoji(Emojis.Warning)} ${description}\n\n${serversCount}\n${serverLines}`)
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
