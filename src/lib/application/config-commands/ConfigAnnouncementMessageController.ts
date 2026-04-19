import { LanguageKeys } from '#lib/i18n/languageKeys';
import { saveGuildConfig } from '#lib/utilities/config-command';
import type { ControllerPrepareResult, ControllerSuccess } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export type ConfigAnnouncementMessagePrepareResult = ControllerPrepareResult<'empty', { message: string; preview: string }>;
export type ConfigAnnouncementMessageApplyResult = ControllerSuccess<
	typeof LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseUpdated,
	{ message: string }
>;

export class ConfigAnnouncementMessageController {
	public constructor(
		private readonly guildRepository: IGuildRepository,
		private readonly options: { defaultAnnouncementMessage?: string } = {}
	) {}

	public prepare(input: { value: string }): ConfigAnnouncementMessagePrepareResult {
		const message = input.value.trim();
		if (message.length === 0) {
			return { status: 'warning', code: 'empty' };
		}

		const preview = message.length > 120 ? `${message.slice(0, 117)}...` : message;
		return { status: 'ready', data: { message, preview } };
	}

	public async apply(input: { guildId: string; message: string; preview: string }): Promise<ConfigAnnouncementMessageApplyResult> {
		await saveGuildConfig(
			this.guildRepository,
			input.guildId,
			{ announcementMessage: input.message },
			this.options.defaultAnnouncementMessage ?? ''
		);

		return {
			status: 'success',
			key: LanguageKeys.Commands.Config.SubcommandAnnouncementMessageResponseUpdated,
			args: { message: input.preview }
		};
	}
}
