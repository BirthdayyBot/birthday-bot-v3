import { container, type Command } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Guild } from '#lib/domain/guild/Guild';
import type { GuildUpdateData } from '#lib/domain/guild/IGuildRepository';

export const DEFAULT_TIMEZONE = 'Europe/London';
export const DEFAULT_LANGUAGE = 'en-US';

export async function getGuildIdOrReply(interaction: Command.ChatInputCommandInteraction): Promise<string | null> {
	if (!interaction.inGuild() || !interaction.guildId) {
		await interaction.reply({ content: await resolveKey(interaction, 'commands:config.errors.guildOnly'), ephemeral: true });
		return null;
	}

	return interaction.guildId;
}

export async function saveGuildConfig(
	guildId: string,
	data: GuildUpdateData,
	interaction?: Command.ChatInputCommandInteraction
): Promise<void> {
	const now = new Date();
	const current = await container.guild.findById(guildId);

	if (current) {
		await container.guild.update(guildId, { ...data, lastUpdated: now });
		return;
	}

	const defaultAnnouncementMessage = interaction
		? await resolveKey(interaction, 'commands:config.defaults.announcementMessage')
		: container.i18n.format(DEFAULT_LANGUAGE, 'commands:config.defaults.announcementMessage');

	await container.guild.upsert(createDefaultGuild(guildId, { ...data, lastUpdated: now }, defaultAnnouncementMessage));
}

function createDefaultGuild(guildId: string, overrides: GuildUpdateData, defaultAnnouncementMessage: string): Guild {
	return new Guild({
		guildId,
		inviter: overrides.inviter === undefined ? null : overrides.inviter,
		announcementChannel: overrides.announcementChannel === undefined ? null : overrides.announcementChannel,
		announcementMessage: overrides.announcementMessage === undefined ? defaultAnnouncementMessage : overrides.announcementMessage,
		overviewChannel: overrides.overviewChannel === undefined ? null : overrides.overviewChannel,
		overviewMessage: overrides.overviewMessage === undefined ? null : overrides.overviewMessage,
		birthdayRole: overrides.birthdayRole === undefined ? null : overrides.birthdayRole,
		birthdayPingRole: overrides.birthdayPingRole === undefined ? null : overrides.birthdayPingRole,
		logChannel: overrides.logChannel === undefined ? null : overrides.logChannel,
		timezone: overrides.timezone === undefined ? DEFAULT_TIMEZONE : overrides.timezone,
		premium: overrides.premium === undefined ? false : overrides.premium,
		language: overrides.language === undefined ? DEFAULT_LANGUAGE : overrides.language,
		lastUpdated: overrides.lastUpdated === undefined ? new Date() : overrides.lastUpdated,
		disabled: overrides.disabled === undefined ? false : overrides.disabled
	});
}