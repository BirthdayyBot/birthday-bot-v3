import type { ChatInputCommandDeniedPayload, ContextMenuCommandDeniedPayload, UserError } from '@sapphire/framework';
import { createDefaultInteractionReply } from '#lib/utilities/default-embed';

export function handleChatInputOrContextMenuCommandDenied(
	{ context, message: content }: UserError,

	{ interaction }: ChatInputCommandDeniedPayload | ContextMenuCommandDeniedPayload
) {
	if (Reflect.get(Object(context), 'silent')) return;

	return interaction.reply(createDefaultInteractionReply(content, interaction.user, { ephemeral: true }, 'warning'));
}
