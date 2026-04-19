import { Precondition } from '@sapphire/framework';
import { OWNERS } from '#root/config';
import type { ChatInputCommandInteraction } from 'discord.js';

export class OwnerOnlyPrecondition extends Precondition {
	public override chatInputRun(interaction: ChatInputCommandInteraction) {
		return OWNERS.includes(interaction.user.id) ? this.ok() : this.error({ message: 'This command is restricted to bot owners.' });
	}
}
