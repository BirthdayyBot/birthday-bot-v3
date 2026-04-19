import { FT, T } from '#lib/types/index';

export const CommandDescription = T<string>('commands/birthday:command.description');

export const ErrorGuildOnly = T<string>('commands/birthday:errors.guildOnly');
export const ErrorMissingPermission = T<string>('commands/birthday:errors.missingPermission');
export const ErrorInvalidDate = T<string>('commands/birthday:errors.invalidDate');

export const ConfirmQuestion = T<string>('commands/birthday:confirm.question');
export const ConfirmCancelled = T<string>('commands/birthday:confirm.cancelled');

// Shared date options (used across register, update)
export const SubcommandOptionMonthDescription = T<string>('commands/birthday:options.month.description');
export const SubcommandOptionDayDescription = T<string>('commands/birthday:options.day.description');
export const SubcommandOptionYearDescription = T<string>('commands/birthday:options.year.description');

// Month choices
export const MonthJanuary = T<string>('commands/birthday:months.january');
export const MonthFebruary = T<string>('commands/birthday:months.february');
export const MonthMarch = T<string>('commands/birthday:months.march');
export const MonthApril = T<string>('commands/birthday:months.april');
export const MonthMay = T<string>('commands/birthday:months.may');
export const MonthJune = T<string>('commands/birthday:months.june');
export const MonthJuly = T<string>('commands/birthday:months.july');
export const MonthAugust = T<string>('commands/birthday:months.august');
export const MonthSeptember = T<string>('commands/birthday:months.september');
export const MonthOctober = T<string>('commands/birthday:months.october');
export const MonthNovember = T<string>('commands/birthday:months.november');
export const MonthDecember = T<string>('commands/birthday:months.december');

export const SubcommandRegisterDescription = T<string>('commands/birthday:subcommands.register.description');
export const SubcommandRegisterOptionMemberDescription = T<string>('commands/birthday:subcommands.register.options.member.description');
export const SubcommandRegisterResponseAlreadyExistsSelf = T<string>('commands/birthday:subcommands.register.responses.alreadyExists.self');
export const SubcommandRegisterResponseAlreadyExistsOther = T<string>('commands/birthday:subcommands.register.responses.alreadyExists.other');
export const SubcommandRegisterResponseRegisteredSelf = FT<{ date: string; timeUntil: string }, string>(
	'commands/birthday:subcommands.register.responses.registered.self'
);
export const SubcommandRegisterResponseRegisteredOther = FT<{ date: string; userId: string; timeUntil: string }, string>(
	'commands/birthday:subcommands.register.responses.registered.other'
);

export const SubcommandUpdateDescription = T<string>('commands/birthday:subcommands.update.description');
export const SubcommandUpdateOptionMemberDescription = T<string>('commands/birthday:subcommands.update.options.member.description');
export const SubcommandUpdateResponseNotFoundSelf = T<string>('commands/birthday:subcommands.update.responses.notFound.self');
export const SubcommandUpdateResponseNotFoundOther = T<string>('commands/birthday:subcommands.update.responses.notFound.other');
export const SubcommandUpdateResponseUpdatedSelf = FT<{ date: string; timeUntil: string }, string>(
	'commands/birthday:subcommands.update.responses.updated.self'
);
export const SubcommandUpdateResponseUpdatedOther = FT<{ date: string; userId: string; timeUntil: string }, string>(
	'commands/birthday:subcommands.update.responses.updated.other'
);

export const SubcommandDeleteDescription = T<string>('commands/birthday:subcommands.delete.description');
export const SubcommandDeleteOptionMemberDescription = T<string>('commands/birthday:subcommands.delete.options.member.description');
export const SubcommandDeleteResponseNotFoundSelf = T<string>('commands/birthday:subcommands.delete.responses.notFound.self');
export const SubcommandDeleteResponseNotFoundOther = T<string>('commands/birthday:subcommands.delete.responses.notFound.other');
export const SubcommandDeleteResponseDeletedSelf = T<string>('commands/birthday:subcommands.delete.responses.deleted.self');
export const SubcommandDeleteResponseDeletedOther = FT<{ userId: string }, string>('commands/birthday:subcommands.delete.responses.deleted.other');

export const SubcommandViewDescription = T<string>('commands/birthday:subcommands.view.description');
export const SubcommandViewOptionMemberDescription = T<string>('commands/birthday:subcommands.view.options.member.description');
export const SubcommandViewResponseNotFoundSelf = T<string>('commands/birthday:subcommands.view.responses.notFound.self');
export const SubcommandViewResponseNotFoundOther = T<string>('commands/birthday:subcommands.view.responses.notFound.other');
export const SubcommandViewResponseDateSelf = FT<{ date: string; timeUntil: string }, string>(
	'commands/birthday:subcommands.view.responses.date.self'
);
export const SubcommandViewResponseDateOther = FT<{ date: string; userId: string; timeUntil: string }, string>(
	'commands/birthday:subcommands.view.responses.date.other'
);
export const SubcommandViewResponseDateWithAgeSelf = FT<{ date: string; age: number; timeUntil: string }, string>(
	'commands/birthday:subcommands.view.responses.dateWithAge.self'
);
export const SubcommandViewResponseDateWithAgeOther = FT<{ date: string; userId: string; age: number; timeUntil: string }, string>(
	'commands/birthday:subcommands.view.responses.dateWithAge.other'
);

export const SubcommandTestDescription = T<string>('commands/birthday:subcommands.test.description');
export const SubcommandTestOptionMemberDescription = T<string>('commands/birthday:subcommands.test.options.member.description');
export const SubcommandTestResponseMissingPermission = T<string>('commands/birthday:subcommands.test.responses.missingPermission');
export const SubcommandTestResponseMissingAnnouncementChannel = T<string>('commands/birthday:subcommands.test.responses.missingAnnouncementChannel');
export const SubcommandTestResponseChannelUnavailable = T<string>('commands/birthday:subcommands.test.responses.channelUnavailable');
export const SubcommandTestResponseEmbedTitle = T<string>('commands/birthday:subcommands.test.responses.embedTitle');
export const SubcommandTestResponseSent = FT<{ channelId: string; userId: string }, string>('commands/birthday:subcommands.test.responses.sent');
