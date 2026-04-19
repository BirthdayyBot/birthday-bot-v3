import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { BirthdayUpdateController } from '#lib/application/birthday-commands/BirthdayUpdateController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { awaitConfirmation } from '#lib/utilities/confirm';
import { editReplyInfo, editReplySuccess, replyWarning } from '#lib/utilities/default-embed';
import { applyBirthdayOptions, resolveBirthdayTarget } from '#lib/utilities/birthday-command';

@ApplyOptions<Command.Options>({
	name: 'birthday-update',
	description: 'Update a registered birthday',
	preconditions: ['GuildOnly'],
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
		const guildId = interaction.guildId!;

		const target = await resolveBirthdayTarget(interaction);
		if (!target) return;

		const { targetId, isSelf } = target;
		const day = interaction.options.getInteger('day', true);
		const month = interaction.options.getInteger('month', true);
		const year = interaction.options.getInteger('year');
		const controller = new BirthdayUpdateController(this.container.birthday, this.container.guild);

		const preparation = await controller.prepare({ guildId, targetId, month, day, year });
		if (preparation.status === 'warning') {
			if (preparation.code === 'invalid-date') {
				return interaction.reply(
					replyWarning(await resolveKey(interaction, LanguageKeys.Commands.Birthday.ErrorInvalidDate), interaction.user)
				);
			}

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

		const applied = await controller.apply({ guildId, targetId, birthday: preparation.data!.birthday, isSelf });
		const text = await resolveKey(interaction, applied.key, applied.args as unknown as Record<string, unknown>);

		return interaction.editReply(editReplySuccess(text, interaction.user));
	}
}
