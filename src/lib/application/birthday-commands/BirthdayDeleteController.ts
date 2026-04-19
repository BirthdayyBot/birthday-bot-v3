import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { ControllerPrepareResult, ControllerSuccess } from '#lib/application/types';
import type { IBirthdayRepository } from '#lib/domain/birthday/IBirthdayRepository';

type DeleteApplyKey =
	| typeof LanguageKeys.Commands.Birthday.SubcommandDeleteResponseDeletedSelf
	| typeof LanguageKeys.Commands.Birthday.SubcommandDeleteResponseDeletedOther;
export type BirthdayDeletePrepareResult = ControllerPrepareResult<'not-found'>;
export type BirthdayDeleteApplyResult = ControllerSuccess<DeleteApplyKey, { userId?: string }>;

export class BirthdayDeleteController {
	public constructor(private readonly birthdayRepository: IBirthdayRepository) {}

	public async prepare(input: { guildId: string; targetId: string }): Promise<BirthdayDeletePrepareResult> {
		const existing = await this.birthdayRepository.findByUserAndGuild(input.targetId, input.guildId);
		if (!existing || !existing.isActive()) {
			return { status: 'warning', code: 'not-found' };
		}

		return { status: 'ready' };
	}

	public async apply(input: { guildId: string; targetId: string; isSelf: boolean }): Promise<BirthdayDeleteApplyResult> {
		await this.birthdayRepository.setDisabled(input.targetId, input.guildId, true);

		if (input.isSelf) {
			return { status: 'success', key: LanguageKeys.Commands.Birthday.SubcommandDeleteResponseDeletedSelf };
		}

		return {
			status: 'success',
			key: LanguageKeys.Commands.Birthday.SubcommandDeleteResponseDeletedOther,
			args: { userId: input.targetId }
		};
	}
}
