import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@kaname-png/plugin-subcommands-advanced';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { BirthdayRegisterController } from '#lib/application/birthday-commands/BirthdayRegisterController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { editReplySuccess, replyWarning } from '#lib/utilities/default-embed';
import { applyBirthdayOptions, resolveBirthdayTarget } from '#lib/utilities/birthday-command';
import { awaitConfirmation } from '#lib/utilities/confirm';

@ApplyOptions<Command.Options>({
	name: 'birthday-register',
	description: 'Register a birthday',
	preconditions: ['GuildOnly'],
	registerSubCommand: {
		parentCommandName: 'birthday',
		slashSubcommand: (sub) =>
			applyDescriptionLocalizedBuilder(
				applyBirthdayOptions(
					sub.setName('register').setDescription('Register a birthday'),
					LanguageKeys.Commands.Birthday.SubcommandRegisterOptionMemberDescription
				),
				LanguageKeys.Commands.Birthday.SubcommandRegisterDescription
			)
	}
})
export class BirthdayRegisterSubcommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildId = interaction.guildId!;

		const target = await resolveBirthdayTarget(interaction);
		if (!target) return;

		const { targetId, isSelf } = target;
		const day = interaction.options.getInteger('day', true);
		const month = interaction.options.getInteger('month', true);
		const year = interaction.options.getInteger('year', true);
		const controller = new BirthdayRegisterController(this.container.birthday, this.container.guild);

		const result = await controller.execute({ guildId, targetId, isSelf, month, day, year });
		if (result.status === 'warning') {
			if (result.code === 'invalid-date') {
				return interaction.reply(
					replyWarning(await resolveKey(interaction, LanguageKeys.Commands.Birthday.ErrorInvalidDate), interaction.user)
				);
			}

			const key = isSelf
				? LanguageKeys.Commands.Birthday.SubcommandRegisterResponseAlreadyExistsSelf
				: LanguageKeys.Commands.Birthday.SubcommandRegisterResponseAlreadyExistsOther;
			return interaction.reply(replyWarning(await resolveKey(interaction, key), interaction.user));
		}

		const hideAge = await awaitConfirmation(interaction, await resolveKey(interaction, LanguageKeys.Commands.Birthday.ConfirmHideAgeQuestion), {
			yesLabel: 'Yes, hide',
			noLabel: 'No, show'
		});
		await this.container.birthday.setHideAge(targetId, guildId, hideAge);

		const text = await resolveKey(interaction, result.key, result.args as unknown as Record<string, unknown>);
		return interaction.editReply(editReplySuccess(text, interaction.user));
	}
}
