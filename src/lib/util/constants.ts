import { URL } from 'node:url';

export const ZeroWidthSpace = '\u200B';

export const rootFolder = new URL('../../../', import.meta.url);
export const srcFolder = new URL('src/', rootFolder);


export enum Emojis {
    RedCross = '❌',
    Warning = '⚠️',
    CheckMark = '✅',
    Info = 'ℹ️',
    Loading = '⏳'
}