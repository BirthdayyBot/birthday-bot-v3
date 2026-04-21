import { FT, T } from '#lib/types/index';

export const CommandDescription = T<string>('commands/config:command.description');

export const DefaultAnnouncementMessage = T<string>('commands/config:defaults.announcementMessage');

export const ErrorGuildOnly = T<string>('commands/config:errors.guildOnly');

export const SubcommandAnnouncementChannelResponseUpdated = FT<{ channelId: string }, string>(
	'commands/config:subcommands.announcementChannel.responses.updated'
);

export const SubcommandAnnouncementMessageResponseEmpty = T<string>('commands/config:subcommands.announcementMessage.responses.empty');
export const SubcommandAnnouncementMessageResponseUpdated = FT<{ message: string }, string>(
	'commands/config:subcommands.announcementMessage.responses.updated'
);

export const SubcommandBirthdayPingRoleResponseUpdated = FT<{ roleId: string }, string>(
	'commands/config:subcommands.birthdayPingRole.responses.updated'
);

export const SubcommandBirthdayRoleResponseUpdated = FT<{ roleId: string }, string>('commands/config:subcommands.birthdayRole.responses.updated');

export const SubcommandLanguageOptionLanguageChoiceEnUS = T<string>('commands/config:subcommands.language.options.language.choices.enUS');
export const SubcommandLanguageOptionLanguageChoiceFrFR = T<string>('commands/config:subcommands.language.options.language.choices.frFR');
export const SubcommandLanguageResponseUpdated = FT<{ language: string }, string>('commands/config:subcommands.language.responses.updated');

export const SubcommandLogChannelResponseUpdated = FT<{ channelId: string }, string>('commands/config:subcommands.logChannel.responses.updated');

export const SubcommandOverviewChannelResponseUpdated = FT<{ channelId: string }, string>(
	'commands/config:subcommands.overviewChannel.responses.updated'
);

export const SubcommandOverviewMessageResponseEmpty = T<string>('commands/config:subcommands.overviewMessage.responses.empty');
export const SubcommandOverviewMessageResponseUpdated = FT<{ message: string }, string>(
	'commands/config:subcommands.overviewMessage.responses.updated'
);

export const SubcommandOverviewSortOptionSortChoiceMonth = T<string>('commands/config:subcommands.overviewSort.options.sort.choices.month');
export const SubcommandOverviewSortOptionSortChoiceUpcoming = T<string>('commands/config:subcommands.overviewSort.options.sort.choices.upcoming');
export const SubcommandOverviewSortResponseUpdated = FT<{ mode: string }, string>('commands/config:subcommands.overviewSort.responses.updated');

export const SubcommandTimezoneResponseUpdated = FT<{ timezone: string }, string>('commands/config:subcommands.timezone.responses.updated');

export const SubcommandViewResponseTitle = T<string>('commands/config:subcommands.view.responses.title');
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
export const SubcommandViewMainWelcome = T<string>('commands/config:subcommands.view.main.welcome');
export const SubcommandViewMainParamsTitle = T<string>('commands/config:subcommands.view.main.paramsTitle');
export const SubcommandViewMainLinksTitle = T<string>('commands/config:subcommands.view.main.linksTitle');
export const SubcommandViewMainBtnPanelWeb = T<string>('commands/config:subcommands.view.main.btnPanelWeb');
export const SubcommandViewMainBtnSupport = T<string>('commands/config:subcommands.view.main.btnSupport');
export const SubcommandViewMainBtnDocs = T<string>('commands/config:subcommands.view.main.btnDocs');
