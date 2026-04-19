import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { ConfigOverviewSortController } from '#lib/application/config-commands/ConfigOverviewSortController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess } from '#lib/utilities/default-embed';
import { BIRTHDAY_SORT_MONTH, BIRTHDAY_SORT_UPCOMING } from '#lib/utilities/birthday-command';

@ApplyOptions<Command.Options>({
	name: 'config-overview-sort',
	description: 'Set the overview sort mode',
	registerSubCommand: {
		parentCommandName: 'config',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('overview-sort')
					.setDescription('Set the overview sort mode')
					.addStringOption((option) =>
						applyDescriptionLocalizedBuilder(
							option
								.setName('sort')
								.setDescription('Sort overview by month or upcoming date')
								.setRequired(true)
								.addChoices(
									createLocalizedChoice(LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceMonth, {
										value: BIRTHDAY_SORT_MONTH
									}),
									createLocalizedChoice(LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming, {
										value: BIRTHDAY_SORT_UPCOMING
									})
								),
							LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortDescription
						)
					),
				LanguageKeys.Commands.Config.SubcommandOverviewSortDescription
			)
	}
})
export class ConfigOverviewSortSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const defaultAnnouncementMessage = await resolveKey(interaction, LanguageKeys.Commands.Config.DefaultAnnouncementMessage);
		const controller = new ConfigOverviewSortController(this.container.guild, { defaultAnnouncementMessage });
		const sort = controller.normalize(interaction.options.getString('sort', true));
		const modeLabel = await resolveKey(interaction, controller.resolveLabelKey(sort));

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		const applied = await controller.apply({ guildId, sort, modeLabel });

		return interaction.editReply(editReplySuccess(await resolveKey(interaction, applied.key, applied.args), interaction.user));
	}
}
