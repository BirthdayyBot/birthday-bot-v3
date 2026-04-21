import { ApplyOptions } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ConfigPage, type RouteResult } from '#lib/config-view/ConfigPage';
import { Emojis } from '#utils/constants';
import type { PageContext } from '#lib/config-view/types';
import { ConfigBirthdayRoleController } from '#lib/application/config-commands/ConfigBirthdayRoleController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { createDefaultEmbed } from '#lib/utilities/default-embed';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	RoleSelectMenuBuilder,
	type InteractionUpdateOptions,
	type MessageComponentInteraction
} from 'discord.js';

@ApplyOptions<ConfigPage.Options>({
	position: 3,
	title: LanguageKeys.Commands.Config.SubcommandViewEditBirthdayRoleTitle,
	selectEmoji: Emojis.Cake
})
export class BirthdayRolePage extends ConfigPage {
	public override async buildContent(ctx: PageContext): Promise<InteractionUpdateOptions> {
		const { guildId, viewController } = ctx;
		const { guild } = (await viewController.execute({ guildId })).data;

		const [none, lBirthdayRole, plhBirthdayRole, removeRole] = await Promise.all([
			resolveKey(ctx.interaction, LanguageKeys.Globals.None),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewLabelBirthdayRole),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditSelectRolePlaceholder),
			resolveKey(ctx.interaction, LanguageKeys.Commands.Config.SubcommandViewEditRemoveRole)
		]);

		const actionBtns: ButtonBuilder[] = [];
		if (guild?.birthdayRole) {
			actionBtns.push(new ButtonBuilder().setCustomId('rm-birthday-role').setLabel(removeRole).setStyle(ButtonStyle.Danger));
		}

		return {
			embeds: [createDefaultEmbed(`> **${lBirthdayRole}:** ${guild?.birthdayRole ? `<@&${guild.birthdayRole}>` : none}`, 'info')],
			components: [
				new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
					new RoleSelectMenuBuilder().setCustomId('edit-birthday-role').setPlaceholder(plhBirthdayRole)
				),
				...(actionBtns.length > 0 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(...actionBtns)] : [])
			]
		};
	}

	public override async handleInteraction(component: MessageComponentInteraction, ctx: PageContext): Promise<RouteResult> {
		const { guildId, guildRepository } = ctx;
		const opts = { defaultAnnouncementMessage: await resolveKey(ctx.interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage) };

		if (component.customId === 'edit-birthday-role' && component.isRoleSelectMenu()) {
			await new ConfigBirthdayRoleController(guildRepository, opts).apply({ guildId, roleId: component.values[0] });
			return 'birthday-role';
		}

		if (component.customId === 'rm-birthday-role') {
			await saveGuildConfig(guildRepository, guildId, { birthdayRole: null }, opts.defaultAnnouncementMessage);
			return 'birthday-role';
		}

		return null;
	}
}
