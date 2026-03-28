import crypto from 'crypto';
import { prisma } from '../lib/prisma.ts';

type TelegramGetMeResponse = {
    ok: boolean;
    result?: {
        id: number;
        is_bot: boolean;
        username?: string;
        first_name?: string;
    };
    description?: string;
};

type TelegramUpdate = {
    update_id: number;
    message?: {
        message_id: number;
        text?: string;
        chat: {
            id: number;
            type: string;
        };
        from?: {
            id: number;
            is_bot: boolean;
            first_name?: string;
            last_name?: string;
            username?: string;
        };
    };
};

type TelegramGetUpdatesResponse = {
    ok: boolean;
    result?: TelegramUpdate[];
    description?: string;
};

type TelegramSendMessageResponse = {
    ok: boolean;
    description?: string;
};

const START_LINK_TTL_MS = 15 * 60 * 1000;

const createTokenHash = (value: string): string => {
    return crypto.createHash('sha256').update(value).digest('hex');
};

const sleep = async (delayMs: number) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
};

class TelegramBotService {
    private readonly token = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
    private readonly apiBase = this.token ? `https://api.telegram.org/bot${this.token}` : '';
    private polling = false;
    private nextUpdateId = 0;
    private ready = false;
    private botUsername: string | null = null;
    private lastError: string | null = null;

    isConfigured(): boolean {
        return this.token.length > 0;
    }

    getStatus() {
        return {
            configured: this.isConfigured(),
            ready: this.ready,
            bot_username: this.botUsername,
            last_error: this.lastError
        };
    }

    getBotUsername(): string | null {
        return this.botUsername;
    }

    buildDeepLink(rawToken: string): string | null {
        if (!this.botUsername) return null;
        return `https://t.me/${this.botUsername}?start=${encodeURIComponent(rawToken)}`;
    }

    async start(): Promise<void> {
        if (!this.isConfigured() || this.polling) {
            return;
        }

        try {
            const me = await this.callTelegram<TelegramGetMeResponse>('getMe');
            if (!me.ok || !me.result?.username) {
                this.ready = false;
                this.lastError = me.description || 'Telegram bot not ready';
                console.error('Telegram bot init failed:', this.lastError);
                return;
            }

            this.botUsername = me.result.username;
            this.ready = true;
            this.lastError = null;
            this.polling = true;
            void this.pollLoop();
        } catch (error) {
            this.ready = false;
            this.lastError = error instanceof Error ? error.message : 'Unknown Telegram init error';
            console.error('Telegram bot init failed:', this.lastError);
        }
    }

    async sendMessage(chatId: string, text: string): Promise<void> {
        if (!this.isConfigured() || !this.ready) {
            return;
        }

        const response = await this.callTelegram<TelegramSendMessageResponse>('sendMessage', {
            chat_id: chatId,
            text,
            disable_web_page_preview: true
        });

        if (!response.ok) {
            throw new Error(response.description || 'Telegram sendMessage failed');
        }
    }

    private async pollLoop(): Promise<void> {
        while (this.polling) {
            try {
                const response = await this.callTelegram<TelegramGetUpdatesResponse>('getUpdates', {
                    offset: this.nextUpdateId,
                    timeout: 20,
                    allowed_updates: ['message']
                });

                if (!response.ok) {
                    this.lastError = response.description || 'Telegram getUpdates failed';
                    this.ready = false;
                    console.error('Telegram polling failed:', this.lastError);
                    await sleep(5000);
                    continue;
                }

                this.ready = true;
                this.lastError = null;
                const updates = response.result || [];
                for (const update of updates) {
                    this.nextUpdateId = update.update_id + 1;
                    await this.handleUpdate(update);
                }
            } catch (error) {
                this.ready = false;
                this.lastError = error instanceof Error ? error.message : 'Unknown Telegram polling error';
                console.error('Telegram polling error:', this.lastError);
                await sleep(5000);
            }
        }
    }

    private async handleUpdate(update: TelegramUpdate): Promise<void> {
        const message = update.message;
        if (!message?.text || message.chat.type !== 'private' || !message.from || message.from.is_bot) {
            return;
        }

        const text = message.text.trim();
        if (!text.startsWith('/start')) {
            return;
        }

        const token = text.slice('/start'.length).trim();
        if (!token) {
            await this.sendMessage(
                String(message.chat.id),
                'Для привязки Telegram откройте раздел "Бот в ТГ" в системе Stones и нажмите кнопку генерации ссылки.'
            );
            return;
        }

        const now = new Date();
        const tokenHash = createTokenHash(token);

        try {
            const linkedUser = await prisma.$transaction(async (tx) => {
                const linkToken = await tx.telegramLinkToken.findUnique({
                    where: { token_hash: tokenHash },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                });

                if (!linkToken || linkToken.used_at || linkToken.expires_at <= now) {
                    return null;
                }

                await tx.telegramConnection.deleteMany({
                    where: {
                        OR: [
                            { user_id: linkToken.user_id },
                            { telegram_user_id: String(message.from?.id) },
                            { chat_id: String(message.chat.id) }
                        ]
                    }
                });

                await tx.telegramConnection.create({
                    data: {
                        user_id: linkToken.user_id,
                        telegram_user_id: String(message.from?.id),
                        chat_id: String(message.chat.id),
                        username: message.from?.username || null,
                        first_name: message.from?.first_name || null,
                        last_name: message.from?.last_name || null,
                        is_active: true,
                        linked_at: now,
                        last_seen_at: now
                    }
                });

                await tx.telegramLinkToken.update({
                    where: { id: linkToken.id },
                    data: { used_at: now }
                });

                return linkToken.user;
            });

            if (!linkedUser) {
                await this.sendMessage(
                    String(message.chat.id),
                    'Ссылка привязки недействительна или уже использована. Сгенерируйте новую в системе Stones.'
                );
                return;
            }

            await this.sendMessage(
                String(message.chat.id),
                `Telegram успешно привязан к аккаунту Stones: ${linkedUser.name}`
            );
        } catch (error) {
            console.error('Telegram link handling failed:', error);
            await this.sendMessage(
                String(message.chat.id),
                'Не удалось завершить привязку. Попробуйте позже или сгенерируйте новую ссылку в системе.'
            );
        }
    }

    private async callTelegram<TResponse>(method: string, body?: Record<string, unknown>): Promise<TResponse> {
        if (!this.isConfigured()) {
            throw new Error('TELEGRAM_BOT_TOKEN is not configured');
        }

        const response = await fetch(`${this.apiBase}/${method}`, {
            method: body ? 'POST' : 'GET',
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(`Telegram API responded with ${response.status}`);
        }

        return await response.json() as TResponse;
    }
}

export const telegramBot = new TelegramBotService();
export const TELEGRAM_LINK_TOKEN_TTL_MS = START_LINK_TTL_MS;
export const hashTelegramLinkToken = createTokenHash;
