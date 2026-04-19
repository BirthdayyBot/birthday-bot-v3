import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { BirthdayViewController } from '#lib/application/birthday-commands/BirthdayViewController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { replyInfo, replyWarning } from '#lib/utilities/default-embed';
import { applyMemberOption, resolveBirthdayTarget } from '#lib/utilities/birthday-command';

@ApplyOptions<Command.Options>({
	name: 'birthday-view',
	description: 'View a registered birthday',
	preconditions: ['GuildOnly'],
	registerSubCommand: {
		parentCommandName: 'birthday',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				applyMemberOption(
					sub.setName('view').setDescription('View a registered birthday'),
					LanguageKeys.Commands.Birthday.SubcommandViewOptionMemberDescription
				),
				LanguageKeys.Commands.Birthday.SubcommandViewDescription
			)
	}
})
export class BirthdayViewSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = interaction.guildId!;

		const target = await resolveBirthdayTarget(interaction);
		if (!target) return;

		const { targetId, isSelf } = target;
		const controller = new BirthdayViewController(this.container.birthday, this.container.guild);
		const result = await controller.execute({ guildId, targetId, isSelf });

		if (result.status === 'warning') {
			const key = isSelf
				? LanguageKeys.Commands.Birthday.SubcommandViewResponseNotFoundSelf
				: LanguageKeys.Commands.Birthday.SubcommandViewResponseNotFoundOther;
			return interaction.reply(replyWarning(await resolveKey(interaction, key), interaction.user));
		}

		const text = await resolveKey(interaction, result.key, result.args as unknown as Record<string, unknown>);

		return interaction.reply(replyInfo(text, interaction.user));
	}
}
