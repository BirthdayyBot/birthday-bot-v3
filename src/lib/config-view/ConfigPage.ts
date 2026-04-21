import { Piece } from '@sapphire/pieces';
import type { TypedT } from '#lib/types/Utils';
import type { MessageComponentInteraction, InteractionUpdateOptions, Awaitable } from 'discord.js';
import type { PageContext } from './types';

export interface ConfigPageOptions extends Piece.Options {
	position: number;
	/** i18n key for the embed title chain (e.g. "Configuration | Général"). */
	title: TypedT<string>;
	/** i18n key shown as the label inside the nav select menu. Defaults to `title` when omitted. */
	selectLabel?: TypedT<string>;
	/** Emoji shown next to the label in the nav select menu. */
	selectEmoji?: string;
	parentPage?: string;
}

/** Return a page name to navigate to, `{ page, params }` to navigate with extra data, or `null` if the interaction was handled in-place. */
export type RouteResult = string | { page: string; params: Record<string, string> } | null;

export abstract class ConfigPage extends Piece<ConfigPageOptions, 'config-pages'> {
	public readonly position: number;
	public readonly title: TypedT<string>;
	public readonly selectLabel: TypedT<string>;
	public readonly selectEmoji: string | undefined;
	public readonly parentPage: string | undefined;

	public constructor(context: ConfigPage.LoaderContext, options: ConfigPageOptions) {
		super(context, options);
		this.position = options.position;
		this.title = options.title;
		this.selectLabel = options.selectLabel ?? options.title;
		this.selectEmoji = options.selectEmoji;
		this.parentPage = options.parentPage;
	}

	public abstract buildContent(ctx: PageContext): Promise<InteractionUpdateOptions>;

	public handleInteraction(_component: MessageComponentInteraction, _ctx: PageContext): Awaitable<RouteResult> {
		return null;
	}
}

export namespace ConfigPage {
	export type LoaderContext = Piece.LoaderContext<'config-pages'>;
	export type Options = ConfigPageOptions;
}
