import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { getTimeZone } from '#lib/utilities/tz';
import type { ControllerPrepareResult, ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

type TimezoneWarningCode = 'invalid' | 'already-set';

export interface TimezonePrepareData {
	timezone: string;
	label: string;
}

export type ConfigTimezonePrepareResult = ControllerPrepareResult<TimezoneWarningCode, TimezonePrepareData>;
export type ConfigTimezoneApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandTimezoneResponseUpdated,
	{ timezone: string }
>;

export class ConfigTimezoneController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public async prepare(input: { guildId: string; value: string }): Promise<ConfigTimezonePrepareResult> {
		const entry = getTimeZone(input.value);
		if (!entry) {
			return { status: 'warning', code: 'invalid', args: { timezone: input.value } };
		}

		const current = await this.guildRepository.findById(input.guildId);
		if (current?.timezone === entry.name) {
			return { status: 'warning', code: 'already-set', args: { timezone: entry.full } };
		}

		return { status: 'ready', data: { timezone: entry.name, label: entry.full } };
	}

	public async apply(input: { guildId: string; timezone: string; label: string }): Promise<ConfigTimezoneApplyResult> {
		await saveGuildConfig(this.guildRepository, input.guildId, { timezone: input.timezone }, this.options.defaultAnnouncementMessage ?? '');

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandTimezoneResponseUpdated,
			args: { timezone: input.label }
		};
	}
}
