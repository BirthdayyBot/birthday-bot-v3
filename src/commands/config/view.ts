import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigViewController } from '#lib/application/config-commands/ConfigViewController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Emojis, resolveEmoji } from '#utils/constants';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { createOverviewEmbed } from '#lib/utilities/default-embed';

@ApplyOptions<Command.Options>({
	name: 'config-view',
	description: 'View the guild configuration',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub.setName('view').setDescription('View the guild configuration'),
				LanguageKeys.Commands.Config.SubcommandViewDescription
			)
	}
})
export class ConfigViewSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const controller = new ConfigViewController(this.container.guild);
		const result = await controller.execute({ guildId });
		const { guild, timezone, language, overviewSort } = result.data;
		const none = await resolveKey(interaction, LanguageKeys.Globals.None);

		const announcementMessage =
			guild?.announcementMessage ?? (await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage));
		const languageLabel = await resolveKey(
			interaction,
			language === 'fr'
				? LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR
				: LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS
		);
		const yes = await resolveKey(interaction, LanguageKeys.Globals.Yes);
		const no = await resolveKey(interaction, LanguageKeys.Globals.No);
		const overviewSortLabel = await resolveKey(
			interaction,
			overviewSort === 'upcoming'
				? LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming
				: LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceMonth
		);

		const timezoneLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandTimezoneOptionTimezoneDescription);
		const languageOptionLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageDescription);
		const announcementChannelLabel = await resolveKey(
			interaction,
			LanguageKeys.Commands.Config.SubcommandAnnouncementChannelOptionChannelDescription
		);
		const overviewChannelLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewChannelOptionChannelDescription);
		const logChannelLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandLogChannelOptionChannelDescription);
		const birthdayRoleLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandBirthdayRoleOptionRoleDescription);
		const birthdayPingRoleLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandBirthdayPingRoleOptionRoleDescription);
		const announcementMessageLabel = await resolveKey(
			interaction,
			LanguageKeys.Commands.Config.SubcommandAnnouncementMessageOptionMessageDescription
		);
		const overviewSortOptionLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewLabelOverviewSort);
		const premiumLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewLabelPremium);
		const activeLabel = await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewLabelActive);
		const arrow = resolveEmoji(Emojis.ArrowRight);

		const embed = createOverviewEmbed(
			await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewResponseTitle),
			[
				{
					name: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewSectionCore),
					value: [
						`${arrow} ${timezoneLabel}: **${timezone}**`,
						`${arrow} ${languageOptionLabel}: **${languageLabel}**`,
						`${arrow} ${overviewSortOptionLabel}: **${overviewSortLabel}**`,
						`${arrow} ${premiumLabel}: **${guild?.premium ? yes : no}**`,
						`${arrow} ${activeLabel}: **${guild?.disabled ? no : yes}**`
					].join('\n')
				},
				{
					name: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewSectionChannels),
					value: [
						`${arrow} ${announcementChannelLabel}: ${guild?.announcementChannel ? `<#${guild.announcementChannel}>` : none}`,
						`${arrow} ${overviewChannelLabel}: ${guild?.overviewChannel ? `<#${guild.overviewChannel}>` : none}`,
						`${arrow} ${logChannelLabel}: ${guild?.logChannel ? `<#${guild.logChannel}>` : none}`
					].join('\n')
				},
				{
					name: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewSectionRoles),
					value: [
						`${arrow} ${birthdayRoleLabel}: ${guild?.birthdayRole ? `<@&${guild.birthdayRole}>` : none}`,
						`${arrow} ${birthdayPingRoleLabel}: ${guild?.birthdayPingRole ? `<@&${guild.birthdayPingRole}>` : none}`
					].join('\n')
				},
				{
					name: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewSectionMessages),
					value: [`${arrow} ${announcementMessageLabel}: ${formatCodePreview(announcementMessage)}`].join('\n\n')
				}
			],
			'info'
		);

		return interaction.reply({ embeds: [embed], ephemeral: true, allowedMentions: { users: [interaction.user.id], roles: [] } });
	}
}

function formatCodePreview(text: string) {
	const normalized = text.replaceAll('```', "'''");
	const clamped = normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;

	return `\`${clamped}\``;
}
