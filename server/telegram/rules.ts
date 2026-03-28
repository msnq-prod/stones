import { prisma } from '../lib/prisma.ts';
import { DEFAULT_TELEGRAM_RULES } from './config.ts';

export const ensureTelegramNotificationRules = async (): Promise<void> => {
    for (const rule of DEFAULT_TELEGRAM_RULES) {
        await prisma.telegramNotificationRule.upsert({
            where: {
                event_type_target_role: {
                    event_type: rule.event_type,
                    target_role: rule.target_role
                }
            },
            update: {},
            create: rule
        });
    }
};
