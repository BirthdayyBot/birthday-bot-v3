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

export const SubcommandOverviewSortDescription = T<string>('commands/config:subcommands.overviewSort.description');
export const SubcommandOverviewSortOptionSortDescription = T<string>('commands/config:subcommands.overviewSort.options.sort.description');
export const SubcommandOverviewSortOptionSortChoiceMonth = T<string>('commands/config:subcommands.overviewSort.options.sort.choices.month');
export const SubcommandOverviewSortOptionSortChoiceUpcoming = T<string>('commands/config:subcommands.overviewSort.options.sort.choices.upcoming');
export const SubcommandOverviewSortResponseUpdated = FT<{ mode: string }, string>('commands/config:subcommands.overviewSort.responses.updated');

export const SubcommandTimezoneDescription = T<string>('commands/config:subcommands.timezone.description');
export const SubcommandTimezoneOptionTimezoneDescription = T<string>('commands/config:subcommands.timezone.options.timezone.description');
export const SubcommandTimezoneResponseAlreadySet = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.alreadySet');
export const SubcommandTimezoneResponseInvalid = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.invalid');
export const SubcommandTimezoneResponseUpdated = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.updated');

export const SubcommandViewDescription = T<string>('commands/config:subcommands.view.description');
export const SubcommandViewResponseTitle = T<string>('commands/config:subcommands.view.responses.title');
export const SubcommandViewSectionGeneral = T<string>('commands/config:subcommands.view.sections.general');
export const SubcommandViewSectionAnnouncements = T<string>('commands/config:subcommands.view.sections.announcements');
export const SubcommandViewSectionBirthdayRole = T<string>('commands/config:subcommands.view.sections.birthdayRole');
export const SubcommandViewSectionOverviewAndLogs = T<string>('commands/config:subcommands.view.sections.overviewAndLogs');
export const SubcommandViewLabelPremium = T<string>('commands/config:subcommands.view.labels.premium');
export const SubcommandViewLabelActive = T<string>('commands/config:subcommands.view.labels.active');
export const SubcommandViewLabelOverviewSort = T<string>('commands/config:subcommands.view.labels.overviewSort');
export const SubcommandViewLabelTimezone = T<string>('commands/config:subcommands.view.labels.timezone');
export const SubcommandViewLabelLanguage = T<string>('commands/config:subcommands.view.labels.language');
export const SubcommandViewLabelAnnouncementChannel = T<string>('commands/config:subcommands.view.labels.announcementChannel');
export const SubcommandViewLabelAnnouncementMessage = T<string>('commands/config:subcommands.view.labels.announcementMessage');
export const SubcommandViewLabelAnnouncementHour = T<string>('commands/config:subcommands.view.labels.announcementHour');
export const SubcommandViewLabelBirthdayPingRole = T<string>('commands/config:subcommands.view.labels.birthdayPingRole');
export const SubcommandViewLabelBirthdayRole = T<string>('commands/config:subcommands.view.labels.birthdayRole');
export const SubcommandViewLabelOverviewChannel = T<string>('commands/config:subcommands.view.labels.overviewChannel');
export const SubcommandViewLabelLogChannel = T<string>('commands/config:subcommands.view.labels.logChannel');
export const SubcommandViewButtonGeneral = T<string>('commands/config:subcommands.view.buttons.general');
export const SubcommandViewButtonAnnouncements = T<string>('commands/config:subcommands.view.buttons.announcements');
export const SubcommandViewButtonBirthdayRole = T<string>('commands/config:subcommands.view.buttons.birthdayRole');
export const SubcommandViewButtonOverviewAndLogs = T<string>('commands/config:subcommands.view.buttons.overviewAndLogs');
export const SubcommandViewButtonBack = T<string>('commands/config:subcommands.view.buttons.back');
export const SubcommandViewButtonPremium = T<string>('commands/config:subcommands.view.buttons.premium');
export const SubcommandViewEditPremiumTitle = T<string>('commands/config:subcommands.view.edit.premiumTitle');
export const SubcommandViewEditGeneralTitle = T<string>('commands/config:subcommands.view.edit.generalTitle');
export const SubcommandViewEditAnnouncementsTitle = T<string>('commands/config:subcommands.view.edit.announcementsTitle');
export const SubcommandViewEditBirthdayRoleTitle = T<string>('commands/config:subcommands.view.edit.birthdayRoleTitle');
export const SubcommandViewEditOverviewAndLogsTitle = T<string>('commands/config:subcommands.view.edit.overviewAndLogsTitle');
export const SubcommandViewEditUpdated = T<string>('commands/config:subcommands.view.edit.updated');
export const SubcommandViewEditSelectLanguagePlaceholder = T<string>('commands/config:subcommands.view.edit.selectLanguagePlaceholder');
export const SubcommandViewEditSelectSortPlaceholder = T<string>('commands/config:subcommands.view.edit.selectSortPlaceholder');
export const SubcommandViewEditSelectChannelPlaceholder = T<string>('commands/config:subcommands.view.edit.selectChannelPlaceholder');
export const SubcommandViewEditSelectHourPlaceholder = T<string>('commands/config:subcommands.view.edit.selectHourPlaceholder');
export const SubcommandViewEditSelectPingRolePlaceholder = T<string>('commands/config:subcommands.view.edit.selectPingRolePlaceholder');
export const SubcommandViewEditSelectRolePlaceholder = T<string>('commands/config:subcommands.view.edit.selectRolePlaceholder');
export const SubcommandViewEditSelectOverviewChannelPlaceholder = T<string>('commands/config:subcommands.view.edit.selectOverviewChannelPlaceholder');
export const SubcommandViewEditSelectLogChannelPlaceholder = T<string>('commands/config:subcommands.view.edit.selectLogChannelPlaceholder');
export const SubcommandViewEditModalMessageButtonLabel = T<string>('commands/config:subcommands.view.edit.modalMessageButtonLabel');
export const SubcommandViewEditModalMessageTitle = T<string>('commands/config:subcommands.view.edit.modalMessageTitle');
export const SubcommandViewEditModalMessageLabel = T<string>('commands/config:subcommands.view.edit.modalMessageLabel');
export const SubcommandViewEditSelectTimezoneRegionPlaceholder = T<string>('commands/config:subcommands.view.edit.selectTimezoneRegionPlaceholder');
export const SubcommandViewEditSelectTimezonePlaceholder = T<string>('commands/config:subcommands.view.edit.selectTimezonePlaceholder');
export const SubcommandViewEditRemoveChannel = T<string>('commands/config:subcommands.view.edit.removeChannel');
export const SubcommandViewEditRemoveRole = T<string>('commands/config:subcommands.view.edit.removeRole');
export const SubcommandViewEditResetMessage = T<string>('commands/config:subcommands.view.edit.resetMessage');
export const SubcommandViewEditPremiumActivateHere = T<string>('commands/config:subcommands.view.edit.premiumActivateHere');
export const SubcommandViewEditPremiumDeactivateHere = T<string>('commands/config:subcommands.view.edit.premiumDeactivateHere');
export const SubcommandViewEditPremiumSlotsLabel = T<string>('commands/config:subcommands.view.edit.premiumSlotsLabel');
export const SubcommandViewEditPremiumServersLabel = T<string>('commands/config:subcommands.view.edit.premiumServersLabel');
export const SubcommandViewEditPremiumNotPatron = T<string>('commands/config:subcommands.view.edit.premiumNotPatron');
export const SubcommandViewEditPremiumNotPatronDescription = T<string>('commands/config:subcommands.view.edit.premiumNotPatronDescription');
export const SubcommandViewEditPremiumPatreonButton = T<string>('commands/config:subcommands.view.edit.premiumPatreonButton');
