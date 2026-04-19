import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigBirthdayRoleApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandBirthdayRoleResponseUpdated,
	{ roleId: string }
>;

export class ConfigBirthdayRoleController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public async apply(input: { guildId: string; roleId: string }): Promise<ConfigBirthdayRoleApplyResult> {
		await saveGuildConfig(this.guildRepository, input.guildId, { birthdayRole: input.roleId }, this.options.defaultAnnouncementMessage ?? '');

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandBirthdayRoleResponseUpdated,
			args: { roleId: input.roleId }
		};
	}
}
