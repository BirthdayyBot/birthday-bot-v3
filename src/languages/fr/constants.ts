import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'fr-FR',
			duration: {
				[TimeTypes.Year]: {
					1: 'an',
					DEFAULT: 'ans'
				},
				[TimeTypes.Month]: {
					1: 'mois',
					DEFAULT: 'mois'
				},
				[TimeTypes.Week]: {
					1: 'semaine',
					DEFAULT: 'semaines'
				},
				[TimeTypes.Day]: {
					1: 'jour',
					DEFAULT: 'jours'
				},
				[TimeTypes.Hour]: {
					1: 'heure',
					DEFAULT: 'heures'
				},
				[TimeTypes.Minute]: {
					1: 'minute',
					DEFAULT: 'minutes'
				},
				[TimeTypes.Second]: {
					1: 'seconde',
					DEFAULT: 'secondes'
				}
			}
		});
	}
}
