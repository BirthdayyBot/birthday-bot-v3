import '#lib/setup/env';
import { getHandler } from '#root/languages/index';
import { LanguageFormatters, languagesFolder } from '#lib/util/constants';
import { container, LogLevel } from '@sapphire/framework';
import { i18next, type I18nextFormatter, type InternationalizationOptions } from '@sapphire/plugin-i18next';
import { cast } from '@sapphire/utilities';
import { envParseInteger, envParseString } from '@skyra/env-utilities';
import type { RedisOptions } from 'bullmq';
import { type ActivitiesOptions, ActivityType, type ClientOptions, GatewayIntentBits, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildVerificationLevel, Locale, Partials, PermissionFlagsBits, time, TimestampStyles, type WebhookClientData } from 'discord.js';
import { fileURLToPath } from 'node:url';
import type { InterpolationOptions } from 'i18next';

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

function parseInternationalizationDefaultVariablesPermissions() {
	const keys = Object.keys(PermissionFlagsBits) as readonly (keyof typeof PermissionFlagsBits)[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<keyof typeof PermissionFlagsBits, keyof typeof PermissionFlagsBits>>;
}

function parseInternationalizationDefaultVariables() {
	return {
		VERSION: process.env.CLIENT_VERSION,
		CLIENT_ID: process.env.CLIENT_ID,
		...parseInternationalizationDefaultVariablesPermissions()
	};
}

function parseInternationalizationInterpolation(): InterpolationOptions {
	return { escapeValue: false, defaultVariables: parseInternationalizationDefaultVariables() };
}


function parseInternationalizationFormatters(): I18nextFormatter[] {
	const { t } = i18next;

	return [
		// Add custom formatters:
		{
			name: LanguageFormatters.Number,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, { maximumFractionDigits: 2, ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		{
			name: LanguageFormatters.NumberCompact,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 2, ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		{
			name: LanguageFormatters.Duration,
			format: (lng, options) => {
				const formatter = getHandler((lng ?? 'en-US') as Locale).duration;
				const precision = (options?.precision as number) ?? 2;
				return (value) => formatter.format(value, precision);
			},
			cached: true
		},
		{
			name: LanguageFormatters.HumanDateTime,
			format: (lng, options) => {
				const formatter = new Intl.DateTimeFormat(lng, { timeZone: 'Etc/UTC', dateStyle: 'short', timeStyle: 'medium', ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		// Add Discord markdown formatters:
		{ name: LanguageFormatters.DateTime, format: (value) => time(new Date(value), TimestampStyles.ShortDateTime) },
		// Add alias formatters:
		{
			name: LanguageFormatters.Permissions,
			format: (value, lng, options) => t(`permissions:${value}`, { lng, ...options }) as string
		},
		{
			name: LanguageFormatters.HumanLevels,
			format: (value, lng, options) => t(`humanLevels:${GuildVerificationLevel[value]}`, { lng, ...options }) as string
		},
		{
			name: LanguageFormatters.ExplicitContentFilter,
			format: (value, lng, options) => t(`guilds:explicitContentFilter${GuildExplicitContentFilter[value]}`, { lng, ...options }) as string
		},
		{
			name: LanguageFormatters.MessageNotifications,
			format: (value, lng, options) =>
				t(`guilds:defaultMessageNotifications${GuildDefaultMessageNotifications[value]}`, { lng, ...options }) as string
		}
	];
}


function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultMissingKey: 'default',
		defaultNS: 'globals',
		defaultLanguageDirectory: fileURLToPath(languagesFolder),
		fetchLanguage: async ({ guild }) => {
			if (!guild) return 'en-US';
			return container.guild.findById(guild.id).then((data) => data?.language ?? 'en-US');
		},
		formatters: parseInternationalizationFormatters(),
		i18next: (_: string[], languages: string[]) => ({
			supportedLngs: languages,
			preload: languages,
			returnObjects: true,
			returnEmptyString: false,
			returnNull: false,
			load: 'all',
			lng: 'en-US',
			fallbackLng: {
				'es-419': ['es-ES', 'en-US'], // Latin America Spanish falls back to Spain Spanish
				default: ['en-US']
			},
			defaultNS: 'globals',
			overloadTranslationOptionHandler: (args) => ({ defaultValue: args[1] ?? 'globals:default' }),
			initImmediate: false,
			interpolation: parseInternationalizationInterpolation()
		})
	};
}


export const CLIENT_OPTIONS: ClientOptions = {
  intents: [GatewayIntentBits.Guilds],
  allowedMentions: { users: [], roles: [] },
  presence: { activities: parsePresenceActivity() },
  loadDefaultErrorListeners: false,
  loadScheduledTaskErrorListeners: false,
  logger: { level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug },
  partials: [Partials.Channel],
  i18n: parseInternationalizationOptions(),
  tasks: {
    bull: {
      connection: {
        ...parseRedisOption(),
        db: envParseInteger('REDIS_TASK_DB')
      }
    }
  }
};
