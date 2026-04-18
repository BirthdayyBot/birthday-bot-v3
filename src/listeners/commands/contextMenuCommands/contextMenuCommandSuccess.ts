import { Listener, LogLevel, type ContextMenuCommandSuccessPayload } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { handleChatInputOrContextMenuCommandSuccess } from '#utils/functions/successHelper';

export class UserListener extends Listener {
	public override run(payload: ContextMenuCommandSuccessPayload) {
		handleChatInputOrContextMenuCommandSuccess(payload);
	}

	public override onLoad() {
		this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}
}
