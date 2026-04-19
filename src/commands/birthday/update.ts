import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyWarning } from '#lib/utilities/default-embed';
import {
	applyBirthdayOptions,
	buildBirthday,
	formatBirthdayDate,
	formatTimeUntilNextBirthday,
	getGuildLocaleAndTimezone,
	resolveBirthdayTarget
} from '#lib/utilities/birthday-command';

@ApplyOptions<Command.Options>({
	name: 'birthday-update',
	description: 'Update a registered birthday',
	registerSubCommand: {
		parentCommandName: 'birthday',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				applyBirthdayOptions(
					sub.setName('update').setDescription('Update a registered birthday'),
					LanguageKeys.Commands.Birthday.SubcommandUpdateOptionMemberDescription
				),
				LanguageKeys.Commands.Birthday.SubcommandUpdateDescription
			)
	}
})
export class BirthdayUpdateSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const target = await resolveBirthdayTarget(interaction);
		if (!target) return;

		const { targetId, isSelf } = target;
		const day = interaction.options.getInteger('day', true);
		const month = interaction.options.getInteger('month', true);
		const year = interaction.options.getInteger('year');

		const birthday = buildBirthday(month, day, year);
		if (!birthday) {
			return interaction.reply(replyWarning(await resolveKey(interaction, LanguageKeys.Commands.Birthday.ErrorInvalidDate), interaction.user));
		}

		const existing = await this.container.birthday.findByUserAndGuild(targetId, guildId);
		if (!existing) {
			const key = isSelf
				? LanguageKeys.Commands.Birthday.SubcommandUpdateResponseNotFoundSelf
				: LanguageKeys.Commands.Birthday.SubcommandUpdateResponseNotFoundOther;
			return interaction.reply(replyWarning(await resolveKey(interaction, key), interaction.user));
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Birthday.ConfirmQuestion));
		if (!confirmed) {
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Birthday.ConfirmCancelled), interaction.user)
			);
		}

		await this.container.birthday.upsert({ userId: targetId, guildId, birthday });

		const { language, timeZone } = await getGuildLocaleAndTimezone(guildId);
		const date = formatBirthdayDate(birthday, language);
		const timeUntil = formatTimeUntilNextBirthday(birthday, timeZone);

		const text = isSelf
			? await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandUpdateResponseUpdatedSelf, { date, timeUntil })
			: await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandUpdateResponseUpdatedOther, {
					date,
					timeUntil,
					userId: targetId
				});

		return interaction.editReply(editReplySuccess(text, interaction.user));
	}
}
