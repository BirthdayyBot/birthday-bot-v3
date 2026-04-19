import { DEFAULT_LANGUAGE, DEFAULT_OVERVIEW_SORT, DEFAULT_TIMEZONE } from '#lib/utilities/config-command';
import type { Guild } from '#lib/domain/guild/Guild';
import type { ControllerData } from '#lib/application/types';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';

export interface ConfigViewData {
	guild: Guild | null;
	timezone: string;
	language: string;
	overviewSort: string;
}

export type ConfigViewResult = ControllerData<ConfigViewData>;

export class ConfigViewController {
	public constructor(private readonly guildRepository: IGuildRepository) {}

	public async execute(input: { guildId: string }): Promise<ConfigViewResult> {
		const guild = await this.guildRepository.findById(input.guildId);

		return {
			status: 'success',
			data: {
				guild,
				timezone: guild?.timezone ?? DEFAULT_TIMEZONE,
				language: guild?.language ?? DEFAULT_LANGUAGE,
				overviewSort: guild?.overviewSort ?? DEFAULT_OVERVIEW_SORT
			}
		};
	}
}
