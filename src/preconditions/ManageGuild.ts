import { Precondition } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export class ManageGuildPrecondition extends Precondition {
	public override chatInputRun(interaction: ChatInputCommandInteraction) {
		return interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
			? this.ok()
			: this.error({ message: 'You need the Manage Server permission to use this command.' });
	}
}
