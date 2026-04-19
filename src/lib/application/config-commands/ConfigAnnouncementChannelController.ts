import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigAnnouncementChannelApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandAnnouncementChannelResponseUpdated,
	{ channelId: string }
>;

export class ConfigAnnouncementChannelController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public async apply(input: { guildId: string; channelId: string }): Promise<ConfigAnnouncementChannelApplyResult> {
		await saveGuildConfig(
			this.guildRepository,
			input.guildId,
			{ announcementChannel: input.channelId },
			this.options.defaultAnnouncementMessage ?? ''
		);

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandAnnouncementChannelResponseUpdated,
			args: { channelId: input.channelId }
		};
	}
}
