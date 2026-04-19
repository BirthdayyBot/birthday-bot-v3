import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { replyInfo, replyWarning } from '#lib/utilities/default-embed';
import {
	applyMemberOption,
	formatBirthdayDate,
	formatTimeUntilNextBirthday,
	getAgeAtNextBirthday,
	getGuildLocaleAndTimezone,
	resolveBirthdayTarget
} from '#lib/utilities/birthday-command';

@ApplyOptions<Command.Options>({
	name: 'birthday-view',
	description: 'View a registered birthday',
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
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const target = await resolveBirthdayTarget(interaction);
		if (!target) return;

		const { targetId, isSelf } = target;

		const existing = await this.container.birthday.findByUserAndGuild(targetId, guildId);
		if (!existing || !existing.isActive()) {
			const key = isSelf
				? LanguageKeys.Commands.Birthday.SubcommandViewResponseNotFoundSelf
				: LanguageKeys.Commands.Birthday.SubcommandViewResponseNotFoundOther;
			return interaction.reply(replyWarning(await resolveKey(interaction, key), interaction.user));
		}

		const { language, timeZone } = await getGuildLocaleAndTimezone(guildId);
		const date = formatBirthdayDate(existing.birthday, language);
		const timeUntil = formatTimeUntilNextBirthday(existing.birthday, timeZone);
		const age = getAgeAtNextBirthday(existing.birthday, timeZone);

		let text: string;
		if (age !== null && isSelf) {
			text = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandViewResponseDateWithAgeSelf, { date, age, timeUntil });
		} else if (age !== null) {
			text = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandViewResponseDateWithAgeOther, {
				date,
				age,
				timeUntil,
				userId: targetId
			});
		} else if (isSelf) {
			text = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandViewResponseDateSelf, { date, timeUntil });
		} else {
			text = await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandViewResponseDateOther, {
				date,
				timeUntil,
				userId: targetId
			});
		}

		return interaction.reply(replyInfo(text, interaction.user));
	}
}
