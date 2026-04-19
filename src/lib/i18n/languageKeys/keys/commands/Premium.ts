import { FT, T } from '#lib/types/index';

export const CommandDescription = T<string>('commands/premium:command.description');

export const SubcommandActivateDescription = T<string>('commands/premium:subcommands.activate.description');
export const SubcommandActivateResponseTitle = T<string>('commands/premium:subcommands.activate.responses.title');
export const SubcommandActivateResponseDescription = FT<{ name: string }, string>('commands/premium:subcommands.activate.responses.description');
export const SubcommandActivateResponseServersCount = FT<{ used: number; max: number }, string>(
	'commands/premium:subcommands.activate.responses.serversCount'
);
export const SubcommandActivateResponseAlreadyActive = T<string>('commands/premium:subcommands.activate.responses.alreadyActive');
export const SubcommandActivateResponseNoSlots = FT<{ used: number; max: number }, string>('commands/premium:subcommands.activate.responses.noSlots');
export const SubcommandActivateResponseNotPatron = T<string>('commands/premium:subcommands.activate.responses.notPatron');
export const SubcommandActivateResponseNotPatronDescription = T<string>('commands/premium:subcommands.activate.responses.notPatronDescription');
export const SubcommandActivateResponsePatreonButton = T<string>('commands/premium:subcommands.activate.responses.patreonButton');
export const SubcommandActivateResponseManageButton = T<string>('commands/premium:subcommands.activate.responses.manageButton');

export const SubcommandDeactivateDescription = T<string>('commands/premium:subcommands.deactivate.description');
export const SubcommandDeactivateResponseTitle = T<string>('commands/premium:subcommands.deactivate.responses.title');
export const SubcommandDeactivateResponseDescription = FT<{ name: string }, string>('commands/premium:subcommands.deactivate.responses.description');
export const SubcommandDeactivateResponseServersCount = FT<{ used: number; max: number }, string>(
	'commands/premium:subcommands.deactivate.responses.serversCount'
);
export const SubcommandDeactivateResponseNoActiveGuilds = T<string>('commands/premium:subcommands.deactivate.responses.noActiveGuilds');
export const SubcommandDeactivateResponseNotActive = T<string>('commands/premium:subcommands.deactivate.responses.notActive');
export const SubcommandDeactivateResponseManageButton = T<string>('commands/premium:subcommands.deactivate.responses.manageButton');

export const SubcommandInfosDescription = T<string>('commands/premium:subcommands.infos.description');
export const SubcommandInfosResponseTitle = T<string>('commands/premium:subcommands.infos.responses.title');
export const SubcommandInfosResponseActive = T<string>('commands/premium:subcommands.infos.responses.active');
export const SubcommandInfosResponseServersCount = FT<{ used: number; max: number }, string>(
	'commands/premium:subcommands.infos.responses.serversCount'
);
export const SubcommandInfosResponseServerEntry = FT<{ name: string; id: string }, string>(
	'commands/premium:subcommands.infos.responses.serverEntry'
);
export const SubcommandInfosResponseServerEntryCurrent = FT<{ name: string; id: string }, string>(
	'commands/premium:subcommands.infos.responses.serverEntryCurrent'
);
export const SubcommandInfosResponseNoActiveGuilds = T<string>('commands/premium:subcommands.infos.responses.noActiveGuilds');
export const SubcommandInfosResponseTipDeactivate = T<string>('commands/premium:subcommands.infos.responses.tipDeactivate');
export const SubcommandInfosResponseNoPatron = T<string>('commands/premium:subcommands.infos.responses.noPatron');
export const SubcommandInfosResponseNoPatronDescription = T<string>('commands/premium:subcommands.infos.responses.noPatronDescription');
export const SubcommandInfosResponsePatreonButton = T<string>('commands/premium:subcommands.infos.responses.patreonButton');
export const SubcommandInfosResponseManageButton = T<string>('commands/premium:subcommands.infos.responses.manageButton');
