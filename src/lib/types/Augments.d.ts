import type { ArrayString } from '@skyra/env-utilities';

declare module '@sapphire/pieces' {
  interface Container {
  }
}

declare module '@skyra/env-utilities' {
  interface Env {
    CLIENT_ID: string;
    CLIENT_VERSION: string;
    CLIENT_PRESENCE_NAME: string;
    CLIENT_PRESENCE_TYPE: string;

    COMMAND_GUILD_IDS: ArrayString;

    DISCORD_TOKEN: string;
  }
}