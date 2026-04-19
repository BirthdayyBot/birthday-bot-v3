import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { sendBirthdayAnnouncement } from '#lib/utilities/announcement-message';
import { applyMemberOption } from '#lib/utilities/birthday-command';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { replyError, replySuccess, replyWarning } from '#lib/utilities/default-embed';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'birthday-test',
	description: 'Send a test birthday announcement',
	registerSubCommand: {
		parentCommandName: 'birthday',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				applyMemberOption(
					sub.setName('test').setDescription('Send a test birthday announcement'),
					LanguageKeys.Commands.Birthday.SubcommandTestOptionMemberDescription
				),
				LanguageKeys.Commands.Birthday.SubcommandTestDescription
			)
	}
})
export class BirthdayTestSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
			return interaction.reply(
				replyError(await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandTestResponseMissingPermission), interaction.user)
			);
		}

		const guildConfig = await this.container.guild.findById(guildId);
		if (!guildConfig || !guildConfig.isActive() || !guildConfig.hasAnnouncementChannel()) {
			return interaction.reply(
				replyWarning(
					await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandTestResponseMissingAnnouncementChannel),
					interaction.user
				)
			);
		}

		const guild = interaction.guild ?? (await this.container.client.guilds.fetch(guildId).catch(() => null));
		if (!guild) {
			return interaction.reply(
				replyWarning(await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandTestResponseChannelUnavailable), interaction.user)
			);
		}

		const channel = await guild.channels.fetch(guildConfig.announcementChannel!).catch(() => null);
		if (!channel || !channel.isTextBased() || !('send' in channel)) {
			return interaction.reply(
				replyWarning(await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandTestResponseChannelUnavailable), interaction.user)
			);
		}

		const targetUser = interaction.options.getUser('member') ?? interaction.user;
		const testEmbedTitle = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandTestResponseEmbedTitle);

		await sendBirthdayAnnouncement({
			guild,
			channel,
			userId: targetUser.id,
			config: guildConfig,
			embedTitle: testEmbedTitle
		});

		return interaction.reply(
			replySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandTestResponseSent, {
					channelId: channel.id,
					userId: targetUser.id
				}),
				interaction.user
			)
		);
	}
}
