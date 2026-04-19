import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply, saveGuildConfig } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess } from '#lib/utilities/default-embed';
import { upsertBirthdayOverviewMessage } from '#lib/utilities/overview-message';

const OVERVIEW_SORT_MONTH = 'month';
const OVERVIEW_SORT_UPCOMING = 'upcoming';

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
										value: OVERVIEW_SORT_MONTH
									}),
									createLocalizedChoice(LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming, {
										value: OVERVIEW_SORT_UPCOMING
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

		const sort = interaction.options.getString('sort', true);
		const modeLabel =
			sort === OVERVIEW_SORT_UPCOMING
				? await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming)
				: await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceMonth);

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmQuestion));
		if (!confirmed)
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Config.ConfirmCancelled), interaction.user)
			);

		await saveGuildConfig(guildId, { overviewSort: sort }, interaction);
		await upsertBirthdayOverviewMessage(guildId);

		return interaction.editReply(
			editReplySuccess(
				await resolveKey(interaction, LanguageKeys.Commands.Config.SubcommandOverviewSortResponseUpdated, { mode: modeLabel }),
				interaction.user
			)
		);
	}
}
