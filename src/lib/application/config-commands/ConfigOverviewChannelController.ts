import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import { upsertBirthdayOverviewMessage } from '#lib/utilities/overview-message';
import type { ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigOverviewChannelApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandOverviewChannelResponseUpdated,
	{ channelId: string }
>;

export class ConfigOverviewChannelController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: {
			defaultAnnouncementMessage?: string;
			refreshOverviewMessage?: (guildId: string) => Promise<unknown>;
		} = {}
	) {}

	public async apply(input: { guildId: string; channelId: string }): Promise<ConfigOverviewChannelApplyResult> {
		await saveGuildConfig(
			this.guildRepository,
			input.guildId,
			{ overviewChannel: input.channelId },
			this.options.defaultAnnouncementMessage ?? ''
		);
		await (this.options.refreshOverviewMessage ?? upsertBirthdayOverviewMessage)(input.guildId);

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandOverviewChannelResponseUpdated,
			args: { channelId: input.channelId }
		};
	}
}
