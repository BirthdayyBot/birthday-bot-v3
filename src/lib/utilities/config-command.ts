import { container, type Command } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Guild } from '#lib/domain/guild/Guild';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { replyError } from '#lib/utilities/default-embed';
import type { GuildUpdateData } from '#lib/domain/guild/IGuildRepository';

export const DEFAULT_TIMEZONE = 'Europe/London';
export const DEFAULT_LANGUAGE = 'en-US';
export const DEFAULT_OVERVIEW_SORT = 'month';

export async function getGuildIdOrReply(interaction: Command.ChatInputCommandInteraction): Promise<string | null> {
	if (!interaction.inGuild() || !interaction.guildId) {
		await interaction.reply(replyError(await resolveKey(interaction, LanguageKeys.Commands.Config.ErrorGuildOnly), interaction.user));
		return null;
	}

	return interaction.guildId;
}

export async function saveGuildConfig(guildId: string, data: GuildUpdateData, interaction?: Command.ChatInputCommandInteraction): Promise<void> {
	const now = new Date();
	const current = await container.guild.findById(guildId);

	if (current) {
		await container.guild.update(guildId, { ...data, lastUpdated: now });
		return;
	}

	const defaultAnnouncementMessage = interaction
		? await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage)
		: container.i18n.format(DEFAULT_LANGUAGE, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);

	await container.guild.upsert(createDefaultGuild(guildId, { ...data, lastUpdated: now }, defaultAnnouncementMessage));
}

function createDefaultGuild(guildId: string, overrides: GuildUpdateData, defaultAnnouncementMessage: string): Guild {
	return new Guild({
		guildId,
		inviter: overrides.inviter ?? null,
		announcementChannel: overrides.announcementChannel ?? null,
		announcementMessage: overrides.announcementMessage ?? defaultAnnouncementMessage,
		overviewChannel: overrides.overviewChannel ?? null,
		overviewMessage: overrides.overviewMessage ?? null,
		overviewSort: overrides.overviewSort ?? DEFAULT_OVERVIEW_SORT,
		birthdayRole: overrides.birthdayRole ?? null,
		birthdayPingRole: overrides.birthdayPingRole ?? null,
		logChannel: overrides.logChannel ?? null,
		timezone: overrides.timezone ?? DEFAULT_TIMEZONE,
		premium: overrides.premium ?? false,
		language: overrides.language ?? DEFAULT_LANGUAGE,
		lastUpdated: overrides.lastUpdated ?? new Date(),
		disabled: overrides.disabled ?? false
	});
}
