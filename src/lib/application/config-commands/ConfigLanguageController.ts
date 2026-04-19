import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigLanguageLabelKey =
	| typeof LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR
	| typeof LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS;

export type ConfigLanguageApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandLanguageResponseUpdated,
	{ language: string }
>;

export class ConfigLanguageController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public resolveLabelKey(language: string): ConfigLanguageLabelKey {
		return language === 'fr'
			? LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceFrFR
			: LanguageKeys.Commands.Config.SubcommandLanguageOptionLanguageChoiceEnUS;
	}

	public async apply(input: { guildId: string; language: string; languageLabel: string }): Promise<ConfigLanguageApplyResult> {
		await saveGuildConfig(this.guildRepository, input.guildId, { language: input.language }, this.options.defaultAnnouncementMessage ?? '');

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandLanguageResponseUpdated,
			args: { language: input.languageLabel }
		};
	}
}
