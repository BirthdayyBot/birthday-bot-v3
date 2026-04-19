import { db } from '#lib/database/client';
import { KyselyBirthdayRepository } from '#lib/infrastructure/repositories/KyselyBirthdayRepository';
import { KyselyBlacklistRepository } from '#lib/infrastructure/repositories/KyselyBlacklistRepository';
import { KyselyGuildRepository } from '#lib/infrastructure/repositories/KyselyGuildRepository';
import { KyselyPremiumRepository } from '#lib/infrastructure/repositories/KyselyPremiumRepository';
import { KyselyUserRepository } from '#lib/infrastructure/repositories/KyselyUserRepository';
import { KyselySubscriptionHistoryRepository } from '#lib/infrastructure/repositories/KyselySubscriptionHistoryRepository';
import { container } from '@sapphire/framework';

container.database = db;
container.birthday = new KyselyBirthdayRepository(db);
container.blacklist = new KyselyBlacklistRepository(db);
container.guild = new KyselyGuildRepository(db);
container.premium = new KyselyPremiumRepository(db);
container.user = new KyselyUserRepository(db);
container.subscriptionHistory = new KyselySubscriptionHistoryRepository(db);
