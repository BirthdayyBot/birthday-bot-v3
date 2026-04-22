import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { HttpCodes, Route } from '@sapphire/plugin-api';
import { envParseString } from '@skyra/env-utilities';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { sendPremiumGrantDM, sendPremiumRevokedDM } from '#lib/utilities/premium-dm';
import { EXPIRATION_TIMES } from '#lib/util/constants';

type PatronStatus = 'active_patron' | 'declined_patron' | 'former_patron';

// Slots granted per Patreon tier title
const TIER_SLOTS: Record<string, number> = {
	'Birthdayy Premium': 1,
	'Super Supporter': 3
};

interface PatreonWebhookBody {
	data: {
		id: string;
		attributes: {
			patron_status: PatronStatus | null;
		};
		relationships: {
			user: { data: { id: string } };
			currently_entitled_tiers: { data: Array<{ id: string }> };
		};
		type: 'member';
	};
}

interface PatreonMemberResponse {
	data: {
		id: string;
		type: 'member';
	};
	included?: Array<{
		id: string;
		type: string;
		attributes: {
			// user
			social_connections?: { discord?: { user_id: string } | null };
			// tier
			title?: string;
		};
	}>;
}

const PATREON_API_BASE = 'https://www.patreon.com/api/oauth2/v2';

export class PatreonWebhookRoute extends Route {
	public async run(request: Route.Request, response: Route.Response) {
		const signature = request.headers['x-patreon-signature'] as string | undefined;
		if (!signature) return response.error(HttpCodes.Unauthorized);

		const body = await request.readBodyText();

		const secret = envParseString('PATREON_WEBHOOK_SECRET');
		const expected = createHmac('md5', secret).update(body).digest('hex');

		if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
			return response.error(HttpCodes.Unauthorized);
		}

		const event = request.headers['x-patreon-event'] as string | undefined;
		const payload: PatreonWebhookBody = JSON.parse(body);

		const memberId = payload.data.id;
		const patronStatus = payload.data.attributes.patron_status;
		const isActive = patronStatus === 'active_patron' && event !== 'members:delete';

		const memberData = await this.fetchMemberData(memberId);
		if (!memberData) return response.noContent();

		const { discordUserId, tierTitle } = memberData;
		if (!discordUserId) return response.noContent();

		if (isActive) {
			const slots = TIER_SLOTS[tierTitle ?? ''] ?? 1;
			const resolvedTier = tierTitle ?? 'Birthdayy Premium';

			const existing = await this.container.premium.findByUserId(discordUserId);
			if (!existing.some((g) => g.isUserGrant())) {
				await this.container.premium.add({ userId: discordUserId });
			}
			await this.container.user.upsert({ userId: discordUserId, lastUpdated: new Date() });
			await this.container.user.setPremium(discordUserId, true);
			await this.container.user.setPatreonSlots(discordUserId, slots);

			// Only start a new history entry if there isn't one already active
			const activeEntry = await this.container.subscriptionHistory.findActiveByUserId(discordUserId);
			if (!activeEntry) {
				await this.container.subscriptionHistory.start({ userId: discordUserId, tier: resolvedTier, slots, source: 'patreon' });
				await sendPremiumGrantDM(discordUserId, slots, resolvedTier, EXPIRATION_TIMES.permanent.label);
			}
		} else {
			await this.container.premium.removeUserGrantByUserId(discordUserId);
			await this.container.user.setPremium(discordUserId, false);
			await this.container.user.setPatreonSlots(discordUserId, 0);
			await this.container.subscriptionHistory.end(discordUserId);
			await sendPremiumRevokedDM(discordUserId);
		}

		return response.noContent();
	}

	private async fetchMemberData(memberId: string): Promise<{ discordUserId: string | null; tierTitle: string | null } | null> {
		const creatorToken = envParseString('PATREON_CREATOR_ACCESS_TOKEN');
		const url = `${PATREON_API_BASE}/members/${memberId}?include=user,currently_entitled_tiers&fields%5Buser%5D=social_connections&fields%5Btier%5D=title`;

		try {
			const data = await fetch<PatreonMemberResponse>(url, { headers: { Authorization: `Bearer ${creatorToken}` } }, FetchResultTypes.JSON);

			const patreonUserId = data.data.id;
			const user = data.included?.find((item) => item.type === 'user' && item.id === patreonUserId);
			const tier = data.included?.find((item) => item.type === 'tier');

			return {
				discordUserId: user?.attributes?.social_connections?.discord?.user_id ?? null,
				tierTitle: tier?.attributes?.title ?? null
			};
		} catch (error) {
			this.container.logger.error('[PatreonWebhook] Failed to fetch member:', error);
			return null;
		}
	}
}
