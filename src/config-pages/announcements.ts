import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import { Emojis } from '#utils/constants';
import type { PageContext } from '#lib/config-view/types';
import { ConfigAnnouncementChannelController } from '#lib/application/config-commands/ConfigAnnouncementChannelController';
import { ConfigAnnouncementMessageController } from '#lib/application/config-commands/ConfigAnnouncementMessageController';
import { ConfigBirthdayPingRoleController } from '#lib/application/config-commands/ConfigBirthdayPingRoleController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	ModalBuilder,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
	type InteractionUpdateOptions,
	type MessageComponentInteraction
} from 'discord.js';

@ApplyOptions<ConfigPage.Options>({
	position: 2,
	title: LanguageKeys.Commands.Config.SubcommandViewEditAnnouncementsTitle,
	selectEmoji: Emojis.Alarm
})
export class AnnouncementsPage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController } = ctx;
		const { guild } = (await viewController.execute({ guildId })).data;

		const [
			none,
			defaultMsg,
			lAnnChannel,
			lAnnMessage,
			lAnnHour,
			lPingRole,
			plhAnnChannel,
			plhAnnHour,
			plhPingRole,
			msgBtnLabel,
			removeChannel,
			removeRole,
			resetMessage
		] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Globals.None),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelAnnouncementChannel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelAnnouncementMessage),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelAnnouncementHour),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelBirthdayPingRole),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectChannelPlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectHourPlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectPingRolePlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditModalMessageButtonLabel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditRemoveChannel),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditRemoveRole),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditResetMessage)
		]);

		const annMsg = guild?.announcementMessage ?? defaultMsg;
		const annMsgPreview = this.formatCodePreview(annMsg);
		const annHour = this.formatHour(guild?.announcementHour ?? 9);

		const actionBtns: ButtonBuilder[] = [new ButtonBuilder().setCustomId('edit-ann-message').setLabel(msgBtnLabel).setStyle(ButtonStyle.Primary)];
		if (guild?.announcementMessage)
			actionBtns.push(new ButtonBuilder().setCustomId('rm-ann-message').setLabel(resetMessage).setStyle(ButtonStyle.Danger));
		if (guild?.announcementChannel)
			actionBtns.push(new ButtonBuilder().setCustomId('rm-ann-channel').setLabel(removeChannel).setStyle(ButtonStyle.Danger));
		if (guild?.birthdayPingRole)
			actionBtns.push(new ButtonBuilder().setCustomId('rm-pingrole').setLabel(removeRole).setStyle(ButtonStyle.Danger));

		return {
			embeds: [
				createDefaultEmbed(
					[
						`> **${lAnnChannel}:** ${guild?.announcementChannel ? `<#${guild.announcementChannel}>` : none}`,
						`> **${lAnnMessage}:** ${annMsgPreview}`,
						`> **${lAnnHour}:** ${annHour}`,
						`> **${lPingRole}:** ${guild?.birthdayPingRole ? `<@&${guild.birthdayPingRole}>` : none}`
					].join('\n'),
					'info'
				)
			],
			components: [
				new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
					new ChannelSelectMenuBuilder()
						.setCustomId('edit-ann-channel')
						.setPlaceholder(plhAnnChannel)
						.setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('edit-ann-hour')
						.setPlaceholder(plhAnnHour)
						.addOptions(
							Array.from({ length: 24 }, (_, h) => ({
								label: this.formatHour(h),
								value: String(h),
								default: (guild?.announcementHour ?? 9) === h
							}))
						)
				),
				new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
					new RoleSelectMenuBuilder().setCustomId('edit-pingrole').setPlaceholder(plhPingRole)
				),
				...(actionBtns.length > 0 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)] : [])
			]
		};
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		const { guildId, guildRepository, interaction } = ctx;
		const opts = { defaultAnnouncementMessage: await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage) };

		switch (component.customId) {
			case 'edit-ann-channel': {
				if (!component.isChannelSelectMenu()) return null;
				await new ConfigAnnouncementChannelController(guildRepository, opts).apply({ guildId, channelId: component.values[0] });
				return 'announcements';
			}

			case 'edit-ann-hour': {
				if (!component.isStringSelectMenu()) return null;
				const hour = Number(component.values[0]);
				if (Number.isInteger(hour) && hour >= 0 && hour <= 23) {
					await saveGuildConfig(guildRepository, guildId, { announcementHour: hour }, opts.defaultAnnouncementMessage);
				}
				return 'announcements';
			}

			case 'edit-pingrole': {
				if (!component.isRoleSelectMenu()) return null;
				await new ConfigBirthdayPingRoleController(guildRepository, opts).apply({ guildId, roleId: component.values[0] });
				return 'announcements';
			}

			case 'edit-ann-message': {
				if (!component.isButton()) return null;
				const [currentMsg, msgModalTitle, msgModalLabel, emptyMsgWarning] = await Promise.all([
					ctx.viewController.execute({ guildId }).then((r) => r.data.guild?.announcementMessage ?? opts.defaultAnnouncementMessage),
					resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewEditModalMessageTitle),
					resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandViewEditModalMessageLabel),
					resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseEmpty)
				]);
				await component.showModal(
					new ModalBuilder()
						.setCustomId('modal-ann-message')
						.setTitle(msgModalTitle)
						.addComponents(
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId('msg-input')
									.setLabel(msgModalLabel)
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
						await sub.reply({ embeds: [createDefaultEmbed(emptyMsgWarning, 'warning')], ephemeral: true });
						return null;
					}
					await ctrl.apply({ guildId, message: prep.data!.message, preview: prep.data!.preview });
					await sub.deferUpdate();
					await interaction.editReply(await this.container.stores.get('config-pages').get('announcements')!.buildContent(ctx));
				} catch {}
				return null;
			}

			case 'rm-ann-message':
				await saveGuildConfig(
					guildRepository,
					guildId,
					{ announcementMessage: opts.defaultAnnouncementMessage },
					opts.defaultAnnouncementMessage
				);
				return 'announcements';

			case 'rm-ann-channel':
				await saveGuildConfig(guildRepository, guildId, { announcementChannel: null }, opts.defaultAnnouncementMessage);
				return 'announcements';

			case 'rm-pingrole':
				await saveGuildConfig(guildRepository, guildId, { birthdayPingRole: null }, opts.defaultAnnouncementMessage);
				return 'announcements';

			default:
				return null;
		}
	}

	private formatHour(hour: number): string {
		return `${String(hour).padStart(2, '0')}:00`;
	}

	private formatCodePreview(text: string): string {
		const normalized = text.replaceAll('```', "'''");
		const clamped = normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
		return `\`${clamped}\``;
	}
}
