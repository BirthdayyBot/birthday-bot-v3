import { FT, T } from '#lib/types/index';
import type { ChannelType } from 'discord.js';

// Sapphire built-in:
export const ClientPermissions = FT<{ missing: string[] }>('preconditions:clientPermissions');
export const ClientPermissionsNoClient = T('preconditions:clientPermissionsNoClient');
export const ClientPermissionsNoPermissions = T('preconditions:clientPermissionsNoPermissions');
export const RunIn = FT<{ types: ChannelType[] }>('preconditions:runIn');
export const UserPermissionsNoPermissions = T('preconditions:userPermissionsNoPermissions');
export const Unavailable = T('preconditions:unavailable');
export const Cooldown = FT<{ remaining: number }>('preconditions:cooldown');
export const DisabledGlobal = T('preconditions:disabledGlobal');
export const Nsfw = T('preconditions:nsfw');
export const UserPermissions = FT<{ missing: string[] }>('preconditions:userPermissions');
export const MissingMessageHandler = T('preconditions:missingMessageHandler');
export const MissingChatInputHandler = T('preconditions:missingChatInputHandler');
export const MissingContextMenuHandler = T('preconditions:missingContextMenuHandler');