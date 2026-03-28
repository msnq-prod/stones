import crypto from 'crypto';
import express from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { prisma } from '../lib/prisma.ts';
import {
    TELEGRAM_EVENT_CATALOG,
    TELEGRAM_PLACEHOLDER_HELP,
    TELEGRAM_TARGET_CATALOG
} from '../telegram/config.ts';
import {
    hashTelegramLinkToken,
    TELEGRAM_LINK_TOKEN_TTL_MS,
    telegramBot
} from '../telegram/bot.ts';
import { ensureTelegramNotificationRules } from '../telegram/rules.ts';

const router = express.Router();

const MANAGE_ROLES = new Set(['ADMIN', 'MANAGER']);
const STAFF_ROLES = new Set(['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FRANCHISEE']);

const canManageTelegram = (role?: string): boolean => MANAGE_ROLES.has(role || '');
const isStaff = (role?: string): boolean => STAFF_ROLES.has(role || '');

router.use(authenticateToken);

router.get('/status', async (req: AuthRequest, res) => {
    if (!req.user || !isStaff(req.user.role)) {
        return res.sendStatus(403);
    }

    try {
        const counts = canManageTelegram(req.user.role)
            ? await prisma.telegramConnection.groupBy({
                by: ['user_id'],
                where: { is_active: true }
            })
            : [];

        const users = counts.length > 0
            ? await prisma.user.findMany({
                where: {
                    id: { in: counts.map((item) => item.user_id) }
                },
                select: {
                    id: true,
                    role: true
                }
            })
            : [];

        const roleCounts = {
            ADMIN: 0,
            MANAGER: 0,
            SALES_MANAGER: 0,
            FRANCHISEE: 0
        };

        for (const user of users) {
            if (user.role in roleCounts) {
                roleCounts[user.role as keyof typeof roleCounts] += 1;
            }
        }

        res.json({
            ...telegramBot.getStatus(),
            counts: canManageTelegram(req.user.role) ? roleCounts : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось загрузить статус Telegram-бота.' });
    }
});

router.get('/rules', async (req: AuthRequest, res) => {
    if (!req.user || !canManageTelegram(req.user.role)) {
        return res.sendStatus(403);
    }

    try {
        await ensureTelegramNotificationRules();

        const rules = await prisma.telegramNotificationRule.findMany({
            orderBy: [
                { event_type: 'asc' },
                { target_role: 'asc' }
            ]
        });

        res.json({
            rules,
            catalog: {
                events: TELEGRAM_EVENT_CATALOG,
                targets: TELEGRAM_TARGET_CATALOG,
                placeholders: TELEGRAM_PLACEHOLDER_HELP
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось загрузить правила уведомлений.' });
    }
});

router.put('/rules/:id', async (req: AuthRequest, res) => {
    if (!req.user || !canManageTelegram(req.user.role)) {
        return res.sendStatus(403);
    }

    const { enabled, message_template } = req.body as {
        enabled?: unknown;
        message_template?: unknown;
    };

    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Поле enabled должно быть boolean.' });
    }

    if (typeof message_template !== 'string' || !message_template.trim()) {
        return res.status(400).json({ error: 'Текст сообщения обязателен.' });
    }

    try {
        const updated = await prisma.telegramNotificationRule.update({
            where: { id: req.params.id },
            data: {
                enabled,
                message_template: message_template.trim()
            }
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось обновить правило уведомлений.' });
    }
});

router.post('/link-token', async (req: AuthRequest, res) => {
    if (!req.user || !isStaff(req.user.role)) {
        return res.sendStatus(403);
    }

    if (!telegramBot.isConfigured() || !telegramBot.getBotUsername()) {
        return res.status(400).json({ error: 'Бот Telegram не настроен. Проверьте TELEGRAM_BOT_TOKEN.' });
    }

    try {
        const rawToken = crypto.randomBytes(24).toString('base64url');
        const expiresAt = new Date(Date.now() + TELEGRAM_LINK_TOKEN_TTL_MS);

        await prisma.$transaction([
            prisma.telegramLinkToken.deleteMany({
                where: {
                    user_id: req.user.id
                }
            }),
            prisma.telegramLinkToken.create({
                data: {
                    user_id: req.user.id,
                    token_hash: hashTelegramLinkToken(rawToken),
                    expires_at: expiresAt
                }
            })
        ]);

        res.json({
            token: rawToken,
            bot_username: telegramBot.getBotUsername(),
            deep_link_url: telegramBot.buildDeepLink(rawToken),
            expires_at: expiresAt.toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось создать ссылку привязки.' });
    }
});

router.get('/me', async (req: AuthRequest, res) => {
    if (!req.user || !isStaff(req.user.role)) {
        return res.sendStatus(403);
    }

    try {
        const connection = await prisma.telegramConnection.findUnique({
            where: { user_id: req.user.id },
            select: {
                id: true,
                chat_id: true,
                telegram_user_id: true,
                username: true,
                first_name: true,
                last_name: true,
                is_active: true,
                linked_at: true,
                last_seen_at: true
            }
        });

        res.json(connection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось загрузить данные Telegram-привязки.' });
    }
});

router.delete('/me', async (req: AuthRequest, res) => {
    if (!req.user || !isStaff(req.user.role)) {
        return res.sendStatus(403);
    }

    try {
        await prisma.$transaction([
            prisma.telegramConnection.deleteMany({
                where: { user_id: req.user.id }
            }),
            prisma.telegramLinkToken.deleteMany({
                where: { user_id: req.user.id }
            })
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Не удалось отключить Telegram-привязку.' });
    }
});

export default router;
