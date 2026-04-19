import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigLogChannelApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandLogChannelResponseUpdated,
	{ channelId: string }
>;

export class ConfigLogChannelController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public async apply(input: { guildId: string; channelId: string }): Promise<ConfigLogChannelApplyResult> {
		await saveGuildConfig(this.guildRepository, input.guildId, { logChannel: input.channelId }, this.options.defaultAnnouncementMessage ?? '');

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandLogChannelResponseUpdated,
			args: { channelId: input.channelId }
		};
	}
}
