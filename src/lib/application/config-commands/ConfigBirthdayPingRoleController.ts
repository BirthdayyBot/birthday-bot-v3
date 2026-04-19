import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigBirthdayPingRoleApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandBirthdayPingRoleResponseUpdated,
	{ roleId: string }
>;

export class ConfigBirthdayPingRoleController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public async apply(input: { guildId: string; roleId: string }): Promise<ConfigBirthdayPingRoleApplyResult> {
		await saveGuildConfig(this.guildRepository, input.guildId, { birthdayPingRole: input.roleId }, this.options.defaultAnnouncementMessage ?? '');

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandBirthdayPingRoleResponseUpdated,
			args: { roleId: input.roleId }
		};
	}
}
