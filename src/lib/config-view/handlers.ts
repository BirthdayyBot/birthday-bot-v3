import { container } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigAnnouncementChannelController } from '#lib/application/config-commands/ConfigAnnouncementChannelController';
import { ConfigAnnouncementMessageController } from '#lib/application/config-commands/ConfigAnnouncementMessageController';
import { ConfigBirthdayPingRoleController } from '#lib/application/config-commands/ConfigBirthdayPingRoleController';
import { ConfigBirthdayRoleController } from '#lib/application/config-commands/ConfigBirthdayRoleController';
import { ConfigLanguageController } from '#lib/application/config-commands/ConfigLanguageController';
import { ConfigLogChannelController } from '#lib/application/config-commands/ConfigLogChannelController';
import { ConfigOverviewChannelController } from '#lib/application/config-commands/ConfigOverviewChannelController';
import { ConfigOverviewSortController } from '#lib/application/config-commands/ConfigOverviewSortController';
import { ConfigTimezoneController } from '#lib/application/config-commands/ConfigTimezoneController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import type { BirthdaySortMode } from '#lib/utilities/birthday-command';
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	type ButtonInteraction,
	type ChannelSelectMenuInteraction,
	type RoleSelectMenuInteraction,
	type StringSelectMenuInteraction
} from 'discord.js';
import type { PremiumGrant } from '#lib/domain/premium/PremiumGrant';
import type { PanelContext } from './types';
import {
	buildAnnouncementsPanel,
	buildBirthdayRolePanel,
	buildGeneralPanel,
	buildMainView,
	buildOverviewLogsPanel,
	buildPremiumPanel,
	buildTimezoneSelectPanel
} from './panels';

// ── Button handler ─────────────────────────────────────────────────────────────

export async function handleButton(component: ButtonInteraction, ctx: PanelContext) {
	const { guildId, labels, viewController, guildRepository, interaction } = ctx;
	const opts = { defaultAnnouncementMessage: labels.defaultMsg };

	switch (component.customId) {
		case 'cfg-back':
			await component.update(await buildMainView(ctx));
			break;

		case 'cfg-general': {
			const { guild, timezone, language } = (await viewController.execute({ guildId })).data;
			await component.update(buildGeneralPanel(labels, guild, timezone, language));
			break;
		}

		case 'cfg-announcements': {
			const { guild } = (await viewController.execute({ guildId })).data;
			await component.update(buildAnnouncementsPanel(labels, guild));
			break;
		}

		case 'cfg-birthday-role': {
			const { guild } = (await viewController.execute({ guildId })).data;
			await component.update(buildBirthdayRolePanel(labels, guild));
			break;
		}

		case 'cfg-overview-logs': {
			const { guild, overviewSort } = (await viewController.execute({ guildId })).data;
			await component.update(buildOverviewLogsPanel(labels, guild, overviewSort));
			break;
		}

		case 'cfg-premium': {
			const [user, grants] = await Promise.all([container.user.findById(ctx.userId), container.premium.findByUserId(ctx.userId)]);
			const guildNames = resolveGrantGuildNames(grants, component, guildId);
			await component.update(
				buildPremiumPanel(labels, user?.patreonMaxSlots ?? 0, grants.filter((g) => g.guildId !== null).length, grants, guildId, guildNames)
			);
			break;
		}

		case 'pm-activate': {
			const [user, grants] = await Promise.all([container.user.findById(ctx.userId), container.premium.findByUserId(ctx.userId)]);
			const maxSlots = user?.patreonMaxSlots ?? 0;
			const usedSlots = grants.filter((g) => g.guildId !== null).length;
			if (maxSlots > 0 && usedSlots < maxSlots && !grants.some((g) => g.guildId === guildId)) {
				await container.premium.add({ userId: ctx.userId, guildId });
				await container.guild.update(guildId, { premium: true });
			}
			const updatedGrants = await container.premium.findByUserId(ctx.userId);
			const guildNames = resolveGrantGuildNames(updatedGrants, component, guildId);
			await component.update(
				buildPremiumPanel(labels, maxSlots, updatedGrants.filter((g) => g.guildId !== null).length, updatedGrants, guildId, guildNames)
			);
			break;
		}

		case 'pm-deactivate': {
			const [user, grants] = await Promise.all([container.user.findById(ctx.userId), container.premium.findByUserId(ctx.userId)]);
			const maxSlots = user?.patreonMaxSlots ?? 0;
			if (grants.some((g) => g.guildId === guildId)) {
				await container.premium.removeByUserAndGuild(ctx.userId, guildId);
				const remainingGrant = await container.premium.findByGuildId(guildId);
				if (!remainingGrant) await container.guild.update(guildId, { premium: false });
			}
			const updatedGrants = await container.premium.findByUserId(ctx.userId);
			const guildNames = resolveGrantGuildNames(updatedGrants, component, guildId);
			await component.update(
				buildPremiumPanel(labels, maxSlots, updatedGrants.filter((g) => g.guildId !== null).length, updatedGrants, guildId, guildNames)
			);
			break;
		}

		case 'edit-ann-message': {
			const currentMsg = (await viewController.execute({ guildId })).data.guild?.announcementMessage ?? labels.defaultMsg;
			await component.showModal(
				new ModalBuilder()
					.setCustomId('modal-ann-message')
					.setTitle(labels.msgModalTitle)
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('msg-input')
								.setLabel(labels.msgModalLabel)
								.setStyle(TextInputStyle.Paragraph)
								.setValue(currentMsg)
								.setMaxLength(1000)
								.setRequired(true)
						)
					)
			);
			try {
				const sub = await component.awaitModalSubmit({
					filter: (i) => i.customId === 'modal-ann-message' && i.user.id === interaction.user.id,
					time: 120_000
				});
				const ctrl = new ConfigAnnouncementMessageController(guildRepository, opts);
				const prep = ctrl.prepare({ value: sub.fields.getTextInputValue('msg-input') });
				if (prep.status === 'warning') {
					const errMsg = await resolveKey(sub, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseEmpty);
					await sub.reply({ embeds: [createDefaultEmbed(errMsg, 'warning')], ephemeral: true });
					return;
				}
				await ctrl.apply({ guildId, message: prep.data!.message, preview: prep.data!.preview });
				await sub.deferUpdate();
				await interaction.editReply(await buildMainView(ctx));
			} catch {}
			break;
		}

		case 'rm-ann-message':
			await saveGuildConfig(guildRepository, guildId, { announcementMessage: labels.defaultMsg }, labels.defaultMsg);
			await component.update(buildAnnouncementsPanel(labels, (await viewController.execute({ guildId })).data.guild));
			break;
		case 'rm-ann-channel':
			await saveGuildConfig(guildRepository, guildId, { announcementChannel: null }, labels.defaultMsg);
			await component.update(await buildMainView(ctx));
			break;
		case 'rm-pingrole':
			await saveGuildConfig(guildRepository, guildId, { birthdayPingRole: null }, labels.defaultMsg);
			await component.update(await buildMainView(ctx));
			break;
		case 'rm-birthday-role':
			await saveGuildConfig(guildRepository, guildId, { birthdayRole: null }, labels.defaultMsg);
			await component.update(await buildMainView(ctx));
			break;
		case 'rm-overview-channel':
			await saveGuildConfig(guildRepository, guildId, { overviewChannel: null }, labels.defaultMsg);
			await component.update(await buildMainView(ctx));
			break;
		case 'rm-log-channel':
			await saveGuildConfig(guildRepository, guildId, { logChannel: null }, labels.defaultMsg);
			await component.update(await buildMainView(ctx));
			break;
	}
}

// ── String select handler ──────────────────────────────────────────────────────

export async function handleStringSelect(component: StringSelectMenuInteraction, ctx: PanelContext) {
	const { guildId, labels, viewController, guildRepository } = ctx;
	const opts = { defaultAnnouncementMessage: labels.defaultMsg };

	switch (component.customId) {
		case 'edit-language': {
			const lang = component.values[0];
			const ctrl = new ConfigLanguageController(guildRepository, opts);
			await ctrl.apply({ guildId, language: lang, languageLabel: await resolveKey(component, ctrl.resolveLabelKey(lang)) });
			await component.update(await buildMainView(ctx));
			break;
		}

		case 'edit-ann-hour': {
			const hour = Number(component.values[0]);
			if (Number.isInteger(hour) && hour >= 0 && hour <= 23) {
				await saveGuildConfig(guildRepository, guildId, { announcementHour: hour }, labels.defaultMsg);
			}
			const { guild } = (await viewController.execute({ guildId })).data;
			await component.update(buildAnnouncementsPanel(labels, guild));
			return;
		}

		case 'edit-overview-sort': {
			const sort = component.values[0] as BirthdaySortMode;
			const ctrl = new ConfigOverviewSortController(guildRepository, opts);
			await ctrl.apply({ guildId, sort, modeLabel: await resolveKey(component, ctrl.resolveLabelKey(sort)) });
			await component.update(await buildMainView(ctx));
			break;
		}

		case 'tz-region': {
			const regionKey = component.values[0];
			const { guild, timezone, language } = (await viewController.execute({ guildId })).data;
			await component.update(buildTimezoneSelectPanel(labels, guild, timezone, language, regionKey));
			break;
		}

		case 'tz-specific': {
			const ctrl = new ConfigTimezoneController(guildRepository, opts);
			const prep = await ctrl.prepare({ guildId, value: component.values[0] });
			if (prep.status !== 'warning') {
				await ctrl.apply({ guildId, timezone: prep.data!.timezone, label: prep.data!.label });
			}
			await component.update(await buildMainView(ctx));
			break;
		}

		default:
			await component.update(await buildMainView(ctx));
	}
}

// ── Channel select handler ─────────────────────────────────────────────────────

export async function handleChannelSelect(component: ChannelSelectMenuInteraction, ctx: PanelContext) {
	const { guildId, labels, guildRepository } = ctx;
	const channelId = component.values[0];
	const opts = { defaultAnnouncementMessage: labels.defaultMsg };

	switch (component.customId) {
		case 'edit-ann-channel':
			await new ConfigAnnouncementChannelController(guildRepository, opts).apply({ guildId, channelId });
			break;
		case 'edit-overview-channel':
			await new ConfigOverviewChannelController(guildRepository, opts).apply({ guildId, channelId });
			break;
		case 'edit-log-channel':
			await new ConfigLogChannelController(guildRepository, opts).apply({ guildId, channelId });
			break;
	}

	await component.update(await buildMainView(ctx));
}

// ── Role select handler ────────────────────────────────────────────────────────

export async function handleRoleSelect(component: RoleSelectMenuInteraction, ctx: PanelContext) {
	const { guildId, labels, guildRepository } = ctx;
	const roleId = component.values[0];
	const opts = { defaultAnnouncementMessage: labels.defaultMsg };

	switch (component.customId) {
		case 'edit-pingrole':
			await new ConfigBirthdayPingRoleController(guildRepository, opts).apply({ guildId, roleId });
			break;
		case 'edit-birthday-role':
			await new ConfigBirthdayRoleController(guildRepository, opts).apply({ guildId, roleId });
			break;
	}

	await component.update(await buildMainView(ctx));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveGrantGuildNames(grants: PremiumGrant[], component: ButtonInteraction, currentGuildId: string): Map<string, string> {
	const map = new Map<string, string>();
	const currentName = component.guild?.name ?? currentGuildId;
	map.set(currentGuildId, currentName);
	for (const grant of grants) {
		if (!grant.guildId) continue;
		const name = component.client.guilds.cache.get(grant.guildId)?.name ?? grant.guildId;
		map.set(grant.guildId, name);
	}
	return map;
}
