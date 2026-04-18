import { URL } from 'node:url';

export const ZeroWidthSpace = '\u200B';

export const rootFolder = new URL('../../../', import.meta.url);
export const srcFolder = new URL('src/', rootFolder);
export const languagesFolder = new URL('languages/', srcFolder);


export enum Emojis {
    RedCross = '❌',
    Warning = '⚠️',
    CheckMark = '✅',
    Info = 'ℹ️',
    Loading = '⏳'
}

export const enum LanguageFormatters {
	Duration = 'duration',
	ExplicitContentFilter = 'explicitContentFilter',
	MessageNotifications = 'messageNotifications',
	Number = 'number',
	NumberCompact = 'numberCompact',
	HumanLevels = 'humanLevels',
	Permissions = 'permissions',
	DateTime = 'dateTime',
	HumanDateTime = 'humanDateTime'
}