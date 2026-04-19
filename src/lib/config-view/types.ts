import type { Command } from '@sapphire/framework';
import type { IGuildRepository } from '#lib/domain/guild/IGuildRepository';
import type { ConfigViewController } from '#lib/application/config-commands/ConfigViewController';

export const VIEW_TIMEOUT_MS = 5 * 60 * 1000;

export interface Labels {
	// Globals
	yes: string;
	no: string;
	none: string;
	defaultMsg: string;
	// Language / sort options
	langEnUS: string;
	langFrFR: string;
	sortMonth: string;
	sortUpcoming: string;
	// Main view
	viewTitle: string;
	// Section headers
	secGeneral: string;
	secAnnouncements: string;
	secBirthdayRole: string;
	secOverviewLogs: string;
	// Field labels
	lTimezone: string;
	lLanguage: string;
	lOverviewSort: string;
	lActive: string;
	lPremium: string;
	lAnnChannel: string;
	lAnnMessage: string;
	lAnnHour: string;
	lPingRole: string;
	lBirthdayRole: string;
	lOverviewChannel: string;
	lLogChannel: string;
	// Navigation buttons
	btnGeneral: string;
	btnAnnouncements: string;
	btnBirthdayRole: string;
	btnOverviewLogs: string;
	btnBack: string;
	btnPremium: string;
	// Panel titles
	editGeneralTitle: string;
	editAnnouncementsTitle: string;
	editBirthdayRoleTitle: string;
	editOverviewLogsTitle: string;
	editPremiumTitle: string;
	// Select placeholders
	plhLang: string;
	plhSort: string;
	plhAnnChannel: string;
	plhAnnHour: string;
	plhPingRole: string;
	plhBirthdayRole: string;
	plhOverviewChannel: string;
	plhLogChannel: string;
	plhTimezoneRegion: string;
	plhTimezone: string;
	// Announcement message modal
	msgBtnLabel: string;
	msgModalTitle: string;
	msgModalLabel: string;
	// Action buttons
	removeChannel: string;
	removeRole: string;
	resetMessage: string;
	// Premium panel
	pmActivateHere: string;
	pmDeactivateHere: string;
	pmSlotsLabel: string;
	pmServersLabel: string;
	pmNotPatron: string;
	pmNotPatronDescription: string;
	pmPatreonButton: string;
}

export interface PanelContext {
	guildId: string;
	userId: string;
	labels: Labels;
	viewController: ConfigViewController;
	guildRepository: IGuildRepository;
	interaction: Command.ChatInputCommandInteraction;
}
