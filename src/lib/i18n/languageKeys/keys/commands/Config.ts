import { FT, T } from '#lib/types/index';

export const AutocompleteTimezoneExact = FT<{ timezone: string }, string>('commands/config:autocomplete.timezone.exact');
export const AutocompleteTimezonePartial = FT<{ timezone: string }, string>('commands/config:autocomplete.timezone.partial');

export const CommandDescription = T<string>('commands/config:command.description');

export const ConfirmQuestion = T<string>('commands/config:confirm.question');
export const ConfirmCancelled = T<string>('commands/config:confirm.cancelled');

export const DefaultAnnouncementMessage = T<string>('commands/config:defaults.announcementMessage');

export const ErrorGuildOnly = T<string>('commands/config:errors.guildOnly');

export const SubcommandAnnouncementChannelDescription = T<string>('commands/config:subcommands.announcementChannel.description');
export const SubcommandAnnouncementChannelOptionChannelDescription = T<string>(
	'commands/config:subcommands.announcementChannel.options.channel.description'
);
export const SubcommandAnnouncementChannelResponseUpdated = FT<{ channelId: string }, string>(
	'commands/config:subcommands.announcementChannel.responses.updated'
);

export const SubcommandAnnouncementMessageDescription = T<string>('commands/config:subcommands.announcementMessage.description');
export const SubcommandAnnouncementMessageOptionMessageDescription = T<string>(
	'commands/config:subcommands.announcementMessage.options.message.description'
);
export const SubcommandAnnouncementMessageResponseEmpty = T<string>('commands/config:subcommands.announcementMessage.responses.empty');
export const SubcommandAnnouncementMessageResponseUpdated = FT<{ message: string }, string>(
	'commands/config:subcommands.announcementMessage.responses.updated'
);

export const SubcommandBirthdayPingRoleDescription = T<string>('commands/config:subcommands.birthdayPingRole.description');
export const SubcommandBirthdayPingRoleOptionRoleDescription = T<string>('commands/config:subcommands.birthdayPingRole.options.role.description');
export const SubcommandBirthdayPingRoleResponseUpdated = FT<{ roleId: string }, string>(
	'commands/config:subcommands.birthdayPingRole.responses.updated'
);

export const SubcommandBirthdayRoleDescription = T<string>('commands/config:subcommands.birthdayRole.description');
export const SubcommandBirthdayRoleOptionRoleDescription = T<string>('commands/config:subcommands.birthdayRole.options.role.description');
export const SubcommandBirthdayRoleResponseUpdated = FT<{ roleId: string }, string>('commands/config:subcommands.birthdayRole.responses.updated');

export const SubcommandLanguageDescription = T<string>('commands/config:subcommands.language.description');
export const SubcommandLanguageOptionLanguageDescription = T<string>('commands/config:subcommands.language.options.language.description');
export const SubcommandLanguageOptionLanguageChoiceEnUS = T<string>('commands/config:subcommands.language.options.language.choices.enUS');
export const SubcommandLanguageOptionLanguageChoiceFrFR = T<string>('commands/config:subcommands.language.options.language.choices.frFR');
export const SubcommandLanguageResponseUpdated = FT<{ language: string }, string>('commands/config:subcommands.language.responses.updated');

export const SubcommandLogChannelDescription = T<string>('commands/config:subcommands.logChannel.description');
export const SubcommandLogChannelOptionChannelDescription = T<string>('commands/config:subcommands.logChannel.options.channel.description');
export const SubcommandLogChannelResponseUpdated = FT<{ channelId: string }, string>('commands/config:subcommands.logChannel.responses.updated');

export const SubcommandOverviewChannelDescription = T<string>('commands/config:subcommands.overviewChannel.description');
export const SubcommandOverviewChannelOptionChannelDescription = T<string>('commands/config:subcommands.overviewChannel.options.channel.description');
export const SubcommandOverviewChannelResponseUpdated = FT<{ channelId: string }, string>(
	'commands/config:subcommands.overviewChannel.responses.updated'
);

export const SubcommandOverviewMessageDescription = T<string>('commands/config:subcommands.overviewMessage.description');
export const SubcommandOverviewMessageOptionMessageDescription = T<string>('commands/config:subcommands.overviewMessage.options.message.description');
export const SubcommandOverviewMessageResponseEmpty = T<string>('commands/config:subcommands.overviewMessage.responses.empty');
export const SubcommandOverviewMessageResponseUpdated = FT<{ message: string }, string>(
	'commands/config:subcommands.overviewMessage.responses.updated'
);

export const SubcommandTimezoneDescription = T<string>('commands/config:subcommands.timezone.description');
export const SubcommandTimezoneOptionTimezoneDescription = T<string>('commands/config:subcommands.timezone.options.timezone.description');
export const SubcommandTimezoneResponseAlreadySet = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.alreadySet');
export const SubcommandTimezoneResponseInvalid = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.invalid');
export const SubcommandTimezoneResponseUpdated = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.updated');

export const SubcommandViewDescription = T<string>('commands/config:subcommands.view.description');
export const SubcommandViewResponseTitle = T<string>('commands/config:subcommands.view.responses.title');
export const SubcommandViewSectionCore = T<string>('commands/config:subcommands.view.sections.core');
export const SubcommandViewSectionChannels = T<string>('commands/config:subcommands.view.sections.channels');
export const SubcommandViewSectionRoles = T<string>('commands/config:subcommands.view.sections.roles');
export const SubcommandViewSectionMessages = T<string>('commands/config:subcommands.view.sections.messages');
export const SubcommandViewLabelPremium = T<string>('commands/config:subcommands.view.labels.premium');
export const SubcommandViewLabelActive = T<string>('commands/config:subcommands.view.labels.active');
