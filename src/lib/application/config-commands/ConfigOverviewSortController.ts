import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { upsertBirthdayOverviewMessage } from '#lib/utilities/overview-message';
import { BIRTHDAY_SORT_UPCOMING, normalizeBirthdaySortMode, type BirthdaySortMode } from '#lib/utilities/birthday-command';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigOverviewSortLabelKey =
	| typeof LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming
	| typeof LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceMonth;

export type ConfigOverviewSortApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandOverviewSortResponseUpdated,
	{ mode: string }
>;

export class ConfigOverviewSortController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: {
			defaultAnnouncementMessage?: string;
			refreshOverviewMessage?: (guildId: string) => Promise<unknown>;
		} = {}
	) {}

	public normalize(value: string | null): BirthdaySortMode {
		return normalizeBirthdaySortMode(value);
	}

	public resolveLabelKey(sort: BirthdaySortMode): ConfigOverviewSortLabelKey {
		return sort === BIRTHDAY_SORT_UPCOMING
			? LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceUpcoming
			: LanguageKeys.Commands.Config.SubcommandOverviewSortOptionSortChoiceMonth;
	}

	public async apply(input: { guildId: string; sort: BirthdaySortMode; modeLabel: string }): Promise<ConfigOverviewSortApplyResult> {
		await saveGuildConfig(this.guildRepository, input.guildId, { overviewSort: input.sort }, this.options.defaultAnnouncementMessage ?? '');
		await (this.options.refreshOverviewMessage ?? upsertBirthdayOverviewMessage)(input.guildId);

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandOverviewSortResponseUpdated,
			args: { mode: input.modeLabel }
		};
	}
}
