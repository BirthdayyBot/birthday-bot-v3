import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getGuildIdOrReply } from '#lib/utilities/config-command';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyWarning } from '#lib/utilities/default-embed';
import { applyMemberOption, resolveBirthdayTarget } from '#lib/utilities/birthday-command';

@ApplyOptions<Command.Options>({
	name: 'birthday-delete',
	description: 'Delete a registered birthday',
	registerSubCommand: {
		parentCommandName: 'birthday',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				applyMemberOption(
					sub.setName('delete').setDescription('Delete a registered birthday'),
					LanguageKeys.Commands.Birthday.SubcommandDeleteOptionMemberDescription
				),
				LanguageKeys.Commands.Birthday.SubcommandDeleteDescription
			)
	}
})
export class BirthdayDeleteSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = await getGuildIdOrReply(interaction);
		if (!guildId) return;

		const target = await resolveBirthdayTarget(interaction);
		if (!target) return;

		const { targetId, isSelf } = target;

		const existing = await this.container.birthday.findByUserAndGuild(targetId, guildId);
		if (!existing || !existing.isActive()) {
			const key = isSelf
				? LanguageKeys.Commands.Birthday.SubcommandDeleteResponseNotFoundSelf
				: LanguageKeys.Commands.Birthday.SubcommandDeleteResponseNotFoundOther;
			return interaction.reply(replyWarning(await resolveKey(interaction, key), interaction.user));
		}

		const confirmed = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Birthday.ConfirmQuestion));
		if (!confirmed) {
			return interaction.editReply(
				editReplyInfo(await resolveKey(interaction, LanguageKeys.Commands.Birthday.ConfirmCancelled), interaction.user)
			);
		}

		await this.container.birthday.setDisabled(targetId, guildId, true);

		const text = isSelf
			? await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandDeleteResponseDeletedSelf)
			: await resolveKey(interaction, LanguageKeys.Commands.Birthday.SubcommandDeleteResponseDeletedOther, { userId: targetId });

		return interaction.editReply(editReplySuccess(text, interaction.user));
	}
}
