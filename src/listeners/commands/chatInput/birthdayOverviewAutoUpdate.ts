import { upsertBirthdayOverviewMessage } from '#lib/utilities/overview-message';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ChatInputCommandSuccessPayload } from '@sapphire/framework';

const BIRTHDAY_COMMAND_NAME = 'birthday';
const BIRTHDAY_MUTATION_SUBCOMMANDS = new Set(['register', 'update', 'delete']);
const LEGACY_COMMAND_NAMES = new Set(['birthday-register', 'birthday-update', 'birthday-delete']);

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandSuccess })
export class BirthdayOverviewAutoUpdateListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public override async run(payload: ChatInputCommandSuccessPayload): Promise<void> {
		const commandName = payload.command.name;
		const subcommandName = payload.interaction.options.getSubcommand(false);

		const isBirthdayMutation =
			(commandName === BIRTHDAY_COMMAND_NAME && subcommandName !== null && BIRTHDAY_MUTATION_SUBCOMMANDS.has(subcommandName)) ||
			LEGACY_COMMAND_NAMES.has(commandName);

		const isConfigMutation = commandName === 'config' && subcommandName !== null && ['timezone', 'language'].includes(subcommandName);

		if (!isBirthdayMutation && !isConfigMutation) return;

		const { guildId } = payload.interaction;
		if (!guildId) return;

		await upsertBirthdayOverviewMessage(guildId).catch((error) => {
			this.container.logger.warn(`[OVERVIEW] Failed to upsert overview message for guild ${guildId}: ${String(error)}`);
		});
	}
}
