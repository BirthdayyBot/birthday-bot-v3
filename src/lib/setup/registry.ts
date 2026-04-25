import { ApplicationCommandRegistries, RegisterBehavior, container } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import { ConfigPageStore } from '#lib/config-view/ConfigPageStore';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
ApplicationCommandRegistries.setDefaultGuildIds(envParseArray('COMMAND_GUILD_IDS', []));

container.stores.register(new ConfigPageStore());
