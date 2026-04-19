import { createDefaultEmbed, createOverviewEmbed } from '#lib/utilities/default-embed';
import { getTimeZonesByPrefix } from '#lib/utilities/tz';
import type { Guild } from '#lib/domain/guild/Guild';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
	type EmbedBuilder,
	type InteractionUpdateOptions
} from 'discord.js';
import type { Labels, PanelContext } from './types';

// ── Timezone data ─────────────────────────────────────────────────────────────

export const TIMEZONE_REGIONS: Record<string, { label: string; emoji: string; prefixes: string[] }> = {
	africa: { label: 'Africa', emoji: '🌍', prefixes: ['africa/'] },
	americas: { label: 'Americas', emoji: '🌎', prefixes: ['america/'] },
	asia: { label: 'Asia', emoji: '🌏', prefixes: ['asia/'] },
	europe: { label: 'Europe', emoji: '🇪🇺', prefixes: ['europe/'] },
	pacific: { label: 'Pacific', emoji: '🌊', prefixes: ['pacific/'] },
	other: { label: 'Other', emoji: '🌐', prefixes: ['atlantic/', 'australia/', 'indian/', 'utc'] }
};

// ── Shared components ─────────────────────────────────────────────────────────

export function buildMainRow(labels: Labels, disabled = false) {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId('cfg-general').setLabel(labels.btnGeneral).setStyle(ButtonStyle.Secondary).setDisabled(disabled),
		new ButtonBuilder().setCustomId('cfg-announcements').setLabel(labels.btnAnnouncements).setStyle(ButtonStyle.Secondary).setDisabled(disabled),
		new ButtonBuilder().setCustomId('cfg-birthday-role').setLabel(labels.btnBirthdayRole).setStyle(ButtonStyle.Secondary).setDisabled(disabled),
		new ButtonBuilder().setCustomId('cfg-overview-logs').setLabel(labels.btnOverviewLogs).setStyle(ButtonStyle.Secondary).setDisabled(disabled)
	);
}

export function buildBackBtn(labels: Labels) {
	return new ButtonBuilder().setCustomId('cfg-back').setLabel(labels.btnBack).setStyle(ButtonStyle.Secondary);
}

function buildPanelEmbed(title: string, lines: string[]): EmbedBuilder {
	return createDefaultEmbed(`**${title}**\n\n${lines.join('\n')}`, 'info');
}

// ── Main view ─────────────────────────────────────────────────────────────────

export async function buildMainView(ctx: PanelContext): Promise<InteractionUpdateOptions> {
	const { guildId, labels, viewController } = ctx;
	const { guild, timezone, language, overviewSort } = (await viewController.execute({ guildId })).data;
	return {
		embeds: [buildMainEmbed(labels, guild, timezone, language, overviewSort)],
		components: [buildMainRow(labels)]
	};
}

function buildMainEmbed(labels: Labels, guild: Guild | null, timezone: string, language: string, overviewSort: string): EmbedBuilder {
	const langLabel = language === 'fr' ? labels.langFrFR : labels.langEnUS;
	const annMsg = guild?.announcementMessage ?? labels.defaultMsg;

	return createOverviewEmbed(labels.viewTitle, [
		{
			name: labels.secGeneral,
			value: [
				`> **${labels.lTimezone}:** ${timezone}`,
				`> **${labels.lLanguage}:** ${langLabel}`,
				`> **${labels.lActive}:** ${guild?.disabled ? labels.no : labels.yes}`,
				`> **${labels.lPremium}:** ${guild?.premium ? labels.yes : labels.no}`
			].join('\n')
		},
		{
			name: labels.secAnnouncements,
			value: [
				`> **${labels.lAnnChannel}:** ${guild?.announcementChannel ? `<#${guild.announcementChannel}>` : labels.none}`,
				`> **${labels.lAnnMessage}:** ${formatCodePreview(annMsg)}`,
				`> **${labels.lPingRole}:** ${guild?.birthdayPingRole ? `<@&${guild.birthdayPingRole}>` : labels.none}`
			].join('\n')
		},
		{
			name: labels.secBirthdayRole,
			value: `> **${labels.lBirthdayRole}:** ${guild?.birthdayRole ? `<@&${guild.birthdayRole}>` : labels.none}`
		},
		{
			name: labels.secOverviewLogs,
			value: [
				`> **${labels.lOverviewChannel}:** ${guild?.overviewChannel ? `<#${guild.overviewChannel}>` : labels.none}`,
				`> **${labels.lOverviewSort}:** ${overviewSort === 'upcoming' ? labels.sortUpcoming : labels.sortMonth}`,
				`> **${labels.lLogChannel}:** ${guild?.logChannel ? `<#${guild.logChannel}>` : labels.none}`
			].join('\n')
		}
	]);
}

// ── General panel ─────────────────────────────────────────────────────────────

export function buildGeneralPanel(labels: Labels, guild: Guild | null, timezone: string, language: string): InteractionUpdateOptions {
	const langLabel = language === 'fr' ? labels.langFrFR : labels.langEnUS;

	return {
		embeds: [
			buildPanelEmbed(labels.editGeneralTitle, [
				`> **${labels.lTimezone}:** ${timezone}`,
				`> **${labels.lLanguage}:** ${langLabel}`,
				`> **${labels.lActive}:** ${guild?.disabled ? labels.no : labels.yes}`,
				`> **${labels.lPremium}:** ${guild?.premium ? labels.yes : labels.no}`
			])
		],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('edit-language')
					.setPlaceholder(labels.plhLang)
					.addOptions([
						{ label: labels.langEnUS, value: 'en-US', emoji: '🇺🇸' },
						{ label: labels.langFrFR, value: 'fr', emoji: '🇫🇷' }
					])
			),
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('tz-region')
					.setPlaceholder(labels.plhTimezoneRegion)
					.addOptions(Object.entries(TIMEZONE_REGIONS).map(([key, r]) => ({ label: r.label, value: key, emoji: r.emoji })))
			),
			new ActionRowBuilder<ButtonBuilder>().addComponents(buildBackBtn(labels))
		]
	};
}

export function buildTimezoneSelectPanel(
	labels: Labels,
	guild: Guild | null,
	timezone: string,
	language: string,
	regionKey: string
): InteractionUpdateOptions {
	const langLabel = language === 'fr' ? labels.langFrFR : labels.langEnUS;
	const region = TIMEZONE_REGIONS[regionKey];

	return {
		embeds: [
			buildPanelEmbed(labels.editGeneralTitle, [
				`> **${labels.lTimezone}:** ${timezone}`,
				`> **${labels.lLanguage}:** ${langLabel}`,
				`> **${labels.lActive}:** ${guild?.disabled ? labels.no : labels.yes}`,
				`> **${labels.lPremium}:** ${guild?.premium ? labels.yes : labels.no}`
			])
		],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('tz-specific')
					.setPlaceholder(labels.plhTimezone)
					.addOptions(
						getTimeZonesByPrefix(region.prefixes)
							.slice(0, 25)
							.map((zone) => ({ label: zone.full, value: zone.name }))
					)
			),
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('cfg-general').setLabel(labels.btnBack).setStyle(ButtonStyle.Secondary)
			)
		]
	};
}

// ── Announcements panel ───────────────────────────────────────────────────────

export function buildAnnouncementsPanel(labels: Labels, guild: Guild | null): InteractionUpdateOptions {
	const annMsg = guild?.announcementMessage ?? labels.defaultMsg;

	const actionBtns: ButtonBuilder[] = [
		new ButtonBuilder().setCustomId('edit-ann-message').setLabel(labels.msgBtnLabel).setStyle(ButtonStyle.Primary)
	];
	if (guild?.announcementChannel) {
		actionBtns.push(new ButtonBuilder().setCustomId('rm-ann-channel').setLabel(labels.removeChannel).setStyle(ButtonStyle.Danger));
	}
	if (guild?.birthdayPingRole) {
		actionBtns.push(new ButtonBuilder().setCustomId('rm-pingrole').setLabel(labels.removeRole).setStyle(ButtonStyle.Danger));
	}
	actionBtns.push(buildBackBtn(labels));

	return {
		embeds: [
			buildPanelEmbed(labels.editAnnouncementsTitle, [
				`> **${labels.lAnnChannel}:** ${guild?.announcementChannel ? `<#${guild.announcementChannel}>` : labels.none}`,
				`> **${labels.lAnnMessage}:** ${formatCodePreview(annMsg)}`,
				`> **${labels.lPingRole}:** ${guild?.birthdayPingRole ? `<@&${guild.birthdayPingRole}>` : labels.none}`
			])
		],
		components: [
			new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
				new ChannelSelectMenuBuilder()
					.setCustomId('edit-ann-channel')
					.setPlaceholder(labels.plhAnnChannel)
					.setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
			),
			new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
				new RoleSelectMenuBuilder().setCustomId('edit-pingrole').setPlaceholder(labels.plhPingRole)
			),
			new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)
		]
	};
}

// ── Birthday role panel ───────────────────────────────────────────────────────

export function buildBirthdayRolePanel(labels: Labels, guild: Guild | null): InteractionUpdateOptions {
	const actionBtns: ButtonBuilder[] = [];
	if (guild?.birthdayRole) {
		actionBtns.push(new ButtonBuilder().setCustomId('rm-birthday-role').setLabel(labels.removeRole).setStyle(ButtonStyle.Danger));
	}
	actionBtns.push(buildBackBtn(labels));

	return {
		embeds: [
			buildPanelEmbed(labels.editBirthdayRoleTitle, [
				`> **${labels.lBirthdayRole}:** ${guild?.birthdayRole ? `<@&${guild.birthdayRole}>` : labels.none}`
			])
		],
		components: [
			new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
				new RoleSelectMenuBuilder().setCustomId('edit-birthday-role').setPlaceholder(labels.plhBirthdayRole)
			),
			new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)
		]
	};
}

// ── Overview & Logs panel ─────────────────────────────────────────────────────

export function buildOverviewLogsPanel(labels: Labels, guild: Guild | null, overviewSort: string): InteractionUpdateOptions {
	const sortLabel = overviewSort === 'upcoming' ? labels.sortUpcoming : labels.sortMonth;

	const actionBtns: ButtonBuilder[] = [];
	if (guild?.overviewChannel) {
		actionBtns.push(new ButtonBuilder().setCustomId('rm-overview-channel').setLabel(labels.removeChannel).setStyle(ButtonStyle.Danger));
	}
	if (guild?.logChannel) {
		actionBtns.push(new ButtonBuilder().setCustomId('rm-log-channel').setLabel(labels.removeChannel).setStyle(ButtonStyle.Danger));
	}
	actionBtns.push(buildBackBtn(labels));

	return {
		embeds: [
			buildPanelEmbed(labels.editOverviewLogsTitle, [
				`> **${labels.lOverviewChannel}:** ${guild?.overviewChannel ? `<#${guild.overviewChannel}>` : labels.none}`,
				`> **${labels.lOverviewSort}:** ${sortLabel}`,
				`> **${labels.lLogChannel}:** ${guild?.logChannel ? `<#${guild.logChannel}>` : labels.none}`
			])
		],
		components: [
			new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
				new ChannelSelectMenuBuilder()
					.setCustomId('edit-overview-channel')
					.setPlaceholder(labels.plhOverviewChannel)
					.setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
			),
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('edit-overview-sort')
					.setPlaceholder(labels.plhSort)
					.addOptions([
						{ label: labels.sortMonth, value: 'month' },
						{ label: labels.sortUpcoming, value: 'upcoming' }
					])
			),
			new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
				new ChannelSelectMenuBuilder()
					.setCustomId('edit-log-channel')
					.setPlaceholder(labels.plhLogChannel)
					.setChannelTypes([ChannelType.GuildText])
			),
			...(actionBtns.length > 0 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)] : [])
		]
	};
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function formatCodePreview(text: string) {
	const normalized = text.replaceAll('```', "'''");
	const clamped = normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
	return `\`${clamped}\``;
}
