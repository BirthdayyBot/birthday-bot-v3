import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

export class UserIsPatreonPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const user = await this.container.user.findById(interaction.user.id);
		return user && user.patreonMaxSlots > 0 ? this.ok() : this.error({ message: 'You need an active Patreon subscription to use this command.' });
	}
}
