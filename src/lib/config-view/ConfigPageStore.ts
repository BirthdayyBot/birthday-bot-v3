import { getRootData, Store } from '@sapphire/pieces';
import { join } from 'node:path';
import { ConfigPage } from './ConfigPage';

export class ConfigPageStore extends Store<ConfigPage, 'config-pages'> {
	public constructor() {
		super(ConfigPage, {
			name: 'config-pages',
			paths: [join(getRootData().root, 'config-pages')]
		});
	}

	public getMainPages(): ConfigPage[] {
		return [...this.values()].filter((p) => !p.parentPage).sort((a, b) => a.position - b.position);
	}

	public getSubPages(parentName: string): ConfigPage[] {
		return [...this.values()].filter((p) => p.parentPage === parentName).sort((a, b) => a.position - b.position);
	}
}
