import '#lib/setup/env';
import { container, LogLevel } from '@sapphire/framework';
import { cast } from '@sapphire/utilities';
import { envParseInteger, envParseString } from '@skyra/env-utilities';
import type { RedisOptions } from 'bullmq';
import { ActivityType, GatewayIntentBits, Partials, type WebhookClientData, type ActivitiesOptions, type ClientOptions } from 'discord.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const OWNERS = ['267614892821970945', '696324357940838492'];

function parsePresenceActivity(): ActivitiesOptions[] {
  const { CLIENT_PRESENCE_NAME } = process.env;
  if (!CLIENT_PRESENCE_NAME) return [];

  return [
    {
      name: CLIENT_PRESENCE_NAME,
      type: cast<Exclude<ActivityType, ActivityType.Custom>>(envParseString('CLIENT_PRESENCE_TYPE', 'WATCHING'))
    }
  ];
}

function parseWebhookError(): WebhookClientData | null {
  const { WEBHOOK_ERROR_TOKEN } = process.env;
  if (!WEBHOOK_ERROR_TOKEN) return null;

  return {
    id: envParseString('WEBHOOK_ERROR_ID'),
    token: WEBHOOK_ERROR_TOKEN
  };
}

export function parseRedisOption(): Pick<RedisOptions, 'port' | 'password' | 'host'> {
  return {
    port: envParseInteger('REDIS_PORT'),
    password: envParseString('REDIS_PASSWORD'),
    host: envParseString('REDIS_HOST')
  };
}

export const WEBHOOK_ERROR = parseWebhookError();

function getLanguageDirectory(): string {
  const distPath = join(process.cwd(), 'dist', 'languages');
  if (existsSync(distPath)) return distPath;

  return join(process.cwd(), 'src', 'languages');
}

export const CLIENT_OPTIONS: ClientOptions = {
  intents: [GatewayIntentBits.Guilds],
  allowedMentions: { users: [], roles: [] },
  presence: { activities: parsePresenceActivity() },
  loadDefaultErrorListeners: false,
  loadScheduledTaskErrorListeners: false,
  logger: { level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug },
  partials: [Partials.Channel],
  i18n: {
    defaultName: 'en-US',
    defaultLanguageDirectory: getLanguageDirectory(),
    fetchLanguage: async ({ guild, interactionLocale, interactionGuildLocale }) => {
      if (guild?.id) {
        const guildEntry = await container.guild.findById(guild.id);
        if (guildEntry?.language) return guildEntry.language;
      }

      return interactionLocale ?? interactionGuildLocale ?? guild?.preferredLocale ?? 'en-US';
    }
  },
  tasks: {
    bull: {
      connection: {
        ...parseRedisOption(),
        db: envParseInteger('REDIS_TASK_DB')
      }
    }
  }
};
