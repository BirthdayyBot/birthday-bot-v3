import { LogLevel } from '@sapphire/framework';
import { cast } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import { ActivityType, GatewayIntentBits, Partials, type ActivitiesOptions, type ClientOptions } from 'discord.js';

export const OWNERS = ['268792781713965056'];

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

export const CLIENT_OPTIONS: ClientOptions = {
  intents: [GatewayIntentBits.Guilds],
  allowedMentions: { users: [], roles: [] },
  presence: { activities: parsePresenceActivity() },
  loadDefaultErrorListeners: false,
  logger: { level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug },
  partials: [Partials.Channel],
};