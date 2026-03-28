import type {
    NotificationEventType,
    NotificationRoleTarget,
    Role,
    TelegramNotificationRule
} from '@prisma/client';
import { prisma } from '../lib/prisma.ts';
import {
    getEventLabel,
    TELEGRAM_DIRECT_TARGET_PRIORITY,
    TELEGRAM_ROLE_TARGETS
} from './config.ts';
import { telegramBot } from './bot.ts';
import { renderTelegramTemplate } from './template.ts';

type NotifyTelegramEventInput = {
    eventType: NotificationEventType;
    actorUserId?: string | null;
    data?: Record<string, unknown>;
};

type RecipientSelection = {
    chatId: string;
    priority: number;
    template: string;
};

const formatTimestamp = (value: Date): string => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(value);
};

const roleMatchesTarget = (role: Role, targetRole: NotificationRoleTarget): boolean => {
    return TELEGRAM_ROLE_TARGETS[targetRole].includes(role);
};

const getPriority = (targetRole: NotificationRoleTarget): number => {
    return TELEGRAM_DIRECT_TARGET_PRIORITY[targetRole] || 0;
};

const buildRecipientMap = (
    rules: TelegramNotificationRule[],
    connections: Array<{
        chat_id: string;
        user: {
            role: Role;
        };
    }>
): Map<string, RecipientSelection> => {
    const recipients = new Map<string, RecipientSelection>();

    for (const connection of connections) {
        for (const rule of rules) {
            if (!roleMatchesTarget(connection.user.role, rule.target_role)) {
                continue;
            }

            const priority = getPriority(rule.target_role);
            const existing = recipients.get(connection.chat_id);
            if (existing && existing.priority >= priority) {
                continue;
            }

            recipients.set(connection.chat_id, {
                chatId: connection.chat_id,
                priority,
                template: rule.message_template
            });
        }
    }

    return recipients;
};

const loadActorName = async (actorUserId?: string | null): Promise<string> => {
    if (!actorUserId) {
        return 'Система';
    }

    const actor = await prisma.user.findUnique({
        where: { id: actorUserId },
        select: { name: true }
    });

    return actor?.name || 'Система';
};

export const notifyTelegramEvent = async (input: NotifyTelegramEventInput): Promise<void> => {
    if (!telegramBot.isConfigured()) {
        return;
    }

    try {
        const rules = await prisma.telegramNotificationRule.findMany({
            where: {
                event_type: input.eventType,
                enabled: true
            },
            orderBy: { target_role: 'asc' }
        });

        if (rules.length === 0) {
            return;
        }

        const connections = await prisma.telegramConnection.findMany({
            where: {
                is_active: true,
                user: {
                    role: {
                        in: ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FRANCHISEE']
                    }
                }
            },
            select: {
                chat_id: true,
                user: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (connections.length === 0) {
            return;
        }

        const recipients = buildRecipientMap(rules, connections);
        if (recipients.size === 0) {
            return;
        }

        const actorName = await loadActorName(input.actorUserId);
        const templateContext = {
            event: getEventLabel(input.eventType),
            actor_name: actorName,
            timestamp: formatTimestamp(new Date()),
            ...(input.data || {})
        };

        const sendResults = await Promise.allSettled(
            [...recipients.values()].map((recipient) => {
                const text = renderTelegramTemplate(recipient.template, templateContext);
                return telegramBot.sendMessage(recipient.chatId, text);
            })
        );

        const rejected = sendResults.filter((result) => result.status === 'rejected');
        if (rejected.length > 0) {
            console.error(`Telegram notifications failed for ${rejected.length} recipient(s) on ${input.eventType}`);
        }
    } catch (error) {
        console.error('Telegram notification dispatch failed:', error);
    }
};
