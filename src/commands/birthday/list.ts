import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { BirthdayListController } from '#lib/application/birthday-commands/BirthdayListController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { createDefaultEmbed, replyInfo } from '#lib/utilities/default-embed';
import { BIRTHDAY_SORT_MONTH, BIRTHDAY_SORT_UPCOMING } from '#lib/utilities/birthday-command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, ComponentType, type GuildMember } from 'discord.js';

const ITEMS_PER_PAGE = 10;
const BUTTON_TIMEOUT_MS = 120_000;

@ApplyOptions<Command.Options>({
	name: 'birthday-list',
	description: 'List birthdays in this server',
	preconditions: ['GuildOnly'],
	registerSubCommand: {
		parentCommandName: 'birthday',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				sub
					.setName('list')
					.setDescription('List birthdays in this server')
					.addIntegerOption((option) =>
						applyDescriptionLocalizedBuilder(
							option.setName('page').setDescription('Page number to open').setRequired(false).setMinValue(1),
							LanguageKeys.Commands.Birthday.SubcommandListOptionPageDescription
						)
					)
					.addStringOption((option) =>
						applyDescriptionLocalizedBuilder(
							option
								.setName('sort')
								.setDescription('Sort birthdays by month or by upcoming date')
								.setRequired(false)
								.addChoices(
									createLocalizedChoice(LanguageKeys.Commands.Birthday.SubcommandListOptionSortChoiceMonth, {
										value: BIRTHDAY_SORT_MONTH
									}),
									createLocalizedChoice(LanguageKeys.Commands.Birthday.SubcommandListOptionSortChoiceUpcoming, {
										value: BIRTHDAY_SORT_UPCOMING
									})
								),
							LanguageKeys.Commands.Birthday.SubcommandListOptionSortDescription
						)
					),
				LanguageKeys.Commands.Birthday.SubcommandListDescription
			)
	}
})
export class BirthdayListSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = interaction.guildId!;
		const controller = new BirthdayListController(this.container.birthday, this.container.guild);
		const result = await controller.execute({ guildId, sortMode: interaction.options.getString('sort') });

		if (result.data.entries.length === 0) {
			await interaction.reply(
				replyInfo(await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListResponseEmpty), interaction.user)
			);
			return;
		}

		const { entries } = result.data;

		const userIds = entries.map((e: { userId: string }) => e.userId);
		const members = (await interaction.guild!.members.fetch({ user: userIds }).catch(() => new Collection<string, GuildMember>())) as Collection<
			string,
			GuildMember
		>;

		const rows = await Promise.all(
			entries.map(async (entry) => {
				const member = members.get(entry.userId);
				const displayName = member?.displayName ?? `<@${entry.userId}>`;
				const username = member?.user.username ?? entry.userId;
				const days = entry.daysUntil;
				const timeUntil =
					days === null
						? '?'
						: days === 0
							? await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListTimeUntilToday)
							: days === 1
								? await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListTimeUntilTomorrow)
								: await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListTimeUntilDays, { days });

				if (entry.age !== null) {
					return resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListResponseEntryWithAge, {
						displayName,
						username,
						date: entry.date,
						age: entry.age,
						timeUntil
					});
				}

				return resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListResponseEntryWithoutAge, {
					displayName,
					username,
					date: entry.date,
					timeUntil
				});
			})
		);

		const footer = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListResponseFooter);
		const pages = chunk(rows, ITEMS_PER_PAGE);
		let currentPage = Math.min(Math.max((interaction.options.getInteger('page') ?? 1) - 1, 0), pages.length - 1);
		const previousCustomId = `birthday_list_prev_${interaction.id}`;
		const nextCustomId = `birthday_list_next_${interaction.id}`;
		const wrongUserMessage = await resolveKey(interaction, LanguageKeys.Globals.PaginatedMessageWrongUserInteractionReply, {
			user: `<@${interaction.user.id}>`
		});

		await interaction.reply({
			embeds: [await this.buildPageEmbed(interaction, pages, currentPage, rows.length, footer)],
			components: [this.buildPaginationRow(currentPage, pages.length, previousCustomId, nextCustomId)],
			ephemeral: true,
			allowedMentions: { users: [interaction.user.id], roles: [] }
		});

		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: BUTTON_TIMEOUT_MS });

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.user.id !== interaction.user.id) {
				await buttonInteraction.reply(replyInfo(wrongUserMessage, buttonInteraction.user));
				return;
			}

			if (buttonInteraction.customId === previousCustomId && currentPage > 0) {
				currentPage -= 1;
			} else if (buttonInteraction.customId === nextCustomId && currentPage < pages.length - 1) {
				currentPage += 1;
			}

			await buttonInteraction.update({
				embeds: [await this.buildPageEmbed(interaction, pages, currentPage, rows.length, footer)],
				components: [this.buildPaginationRow(currentPage, pages.length, previousCustomId, nextCustomId)]
			});
		});

		collector.on('end', async () => {
			try {
				await interaction.editReply({
					components: [this.buildPaginationRow(currentPage, pages.length, previousCustomId, nextCustomId, true)]
				});
			} catch {
				// Ignore failures if the interaction response is no longer editable.
			}
		});
	}

	private async buildPageEmbed(
		interaction: Command.ChatInputCommandInteraction,
		pages: string[][],
		currentPage: number,
		total: number,
		footer: string
	) {
		const title = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListResponseTitle, {
			page: currentPage + 1,
			totalPages: pages.length
		});
		const description = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandListResponseDescription, { total });

		return createDefaultEmbed(`${description}\n\n${pages[currentPage].join('\n')}`, 'info')
			.setTitle(title)
			.setFooter({ text: footer });
	}

	private buildPaginationRow(currentPage: number, totalPages: number, previousCustomId: string, nextCustomId: string, disabled = false) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(previousCustomId)
				.setLabel('Previous')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabled || currentPage <= 0),
			new ButtonBuilder()
				.setCustomId(nextCustomId)
				.setLabel('Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabled || currentPage >= totalPages - 1)
		);
	}
}

function chunk<T>(entries: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let index = 0; index < entries.length; index += size) {
		chunks.push(entries.slice(index, index + size));
	}

	return chunks;
}
