import { useEffect, useState } from 'react';
import { Bot, ExternalLink, Link2, RefreshCw, Unlink2 } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

type TelegramStatus = {
    configured: boolean;
    ready: boolean;
    bot_username: string | null;
    counts: null | Record<string, number>;
};

type TelegramConnection = {
    id: string;
    chat_id: string;
    telegram_user_id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    is_active: boolean;
    linked_at: string;
    last_seen_at: string;
} | null;

type LinkTokenResponse = {
    deep_link_url: string | null;
    expires_at: string;
};

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

type TelegramLinkCardProps = {
    theme?: 'dark' | 'light';
};

export function TelegramLinkCard({ theme = 'dark' }: TelegramLinkCardProps) {
    const [status, setStatus] = useState<TelegramStatus | null>(null);
    const [connection, setConnection] = useState<TelegramConnection>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [deepLink, setDeepLink] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    const dark = theme === 'dark';
    const cardClass = dark
        ? 'rounded-2xl border border-gray-800 bg-gray-900 p-5'
        : 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';
    const textMutedClass = dark ? 'text-gray-400' : 'text-gray-500';
    const borderClass = dark ? 'border-gray-800' : 'border-gray-200';
    const inputBgClass = dark ? 'bg-gray-950 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [statusResponse, meResponse] = await Promise.all([
                authFetch('/api/telegram/status'),
                authFetch('/api/telegram/me')
            ]);

            if (!statusResponse.ok) {
                const payload = await statusResponse.json().catch(() => ({ error: 'Не удалось загрузить статус Telegram.' }));
                throw new Error(payload.error || 'Не удалось загрузить статус Telegram.');
            }

            if (!meResponse.ok) {
                const payload = await meResponse.json().catch(() => ({ error: 'Не удалось загрузить привязку Telegram.' }));
                throw new Error(payload.error || 'Не удалось загрузить привязку Telegram.');
            }

            setStatus(await statusResponse.json() as TelegramStatus);
            setConnection(await meResponse.json() as TelegramConnection);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить Telegram-блок.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const handleGenerateLink = async () => {
        setActionLoading(true);
        setError('');

        try {
            const response = await authFetch('/api/telegram/link-token', {
                method: 'POST'
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: 'Не удалось создать ссылку привязки.' }));
                throw new Error(payload.error || 'Не удалось создать ссылку привязки.');
            }

            const data = await response.json() as LinkTokenResponse;
            setDeepLink(data.deep_link_url || '');
            setExpiresAt(data.expires_at);
        } catch (linkError) {
            setError(linkError instanceof Error ? linkError.message : 'Не удалось создать ссылку привязки.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setActionLoading(true);
        setError('');

        try {
            const response = await authFetch('/api/telegram/me', {
                method: 'DELETE'
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: 'Не удалось отключить Telegram.' }));
                throw new Error(payload.error || 'Не удалось отключить Telegram.');
            }

            setConnection(null);
            setDeepLink('');
            setExpiresAt('');
            await loadData();
        } catch (disconnectError) {
            setError(disconnectError instanceof Error ? disconnectError.message : 'Не удалось отключить Telegram.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <section className={cardClass}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Bot size={18} className={dark ? 'text-blue-300' : 'text-blue-600'} />
                        <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Мой Telegram</h2>
                    </div>
                    <p className={`mt-1 text-sm ${textMutedClass}`}>
                        Привяжите личный Telegram, чтобы получать уведомления из Stones.
                    </p>
                </div>
                <button
                    onClick={() => void loadData()}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${dark ? 'border-gray-700 text-gray-200 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    <RefreshCw size={14} />
                    Обновить
                </button>
            </div>

            {error && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${dark ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className={`mt-4 text-sm ${textMutedClass}`}>Загрузка Telegram-настроек...</div>
            ) : (
                <div className="mt-4 space-y-4">
                    <div className={`rounded-xl border px-4 py-3 ${dark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                        <div className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>
                            {status?.configured
                                ? (status.ready ? 'Бот активен' : 'Бот настроен, но пока не ответил')
                                : 'Бот не настроен'}
                        </div>
                        <div className={`mt-1 text-sm ${textMutedClass}`}>
                            {status?.configured
                                ? `Username бота: @${status.bot_username || 'unknown'}`
                                : 'Добавьте TELEGRAM_BOT_TOKEN в .env и перезапустите сервер.'}
                        </div>
                    </div>

                    <div className={`rounded-xl border px-4 py-3 ${dark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                        {connection ? (
                            <div className="space-y-2">
                                <div className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>
                                    Привязка активна
                                </div>
                                <div className={`text-sm ${textMutedClass}`}>
                                    @{connection.username || 'без username'} | chat_id: {connection.chat_id}
                                </div>
                                <div className={`text-xs ${textMutedClass}`}>
                                    Привязано: {formatDateTime(connection.linked_at)}
                                </div>
                                <div className={`text-xs ${textMutedClass}`}>
                                    Последняя активность: {formatDateTime(connection.last_seen_at)}
                                </div>
                            </div>
                        ) : (
                            <div className={`text-sm ${textMutedClass}`}>
                                Telegram пока не привязан к вашему аккаунту.
                            </div>
                        )}
                    </div>

                    {deepLink && (
                        <div className={`rounded-xl border px-4 py-3 ${dark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
                            <div className={`text-sm font-medium ${dark ? 'text-blue-100' : 'text-blue-900'}`}>
                                Ссылка для привязки готова
                            </div>
                            <div className={`mt-1 text-xs ${dark ? 'text-blue-200' : 'text-blue-700'}`}>
                                Действует до {formatDateTime(expiresAt)}
                            </div>
                            <a
                                href={deepLink}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${dark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                <ExternalLink size={14} />
                                Открыть бота и привязать
                            </a>
                        </div>
                    )}

                    <div className={`flex flex-wrap gap-3 border-t pt-4 ${borderClass}`}>
                        <button
                            onClick={() => void handleGenerateLink()}
                            disabled={actionLoading || !status?.configured}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${dark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            <Link2 size={16} />
                            {connection ? 'Перепривязать Telegram' : 'Сгенерировать ссылку'}
                        </button>
                        <button
                            onClick={() => void handleDisconnect()}
                            disabled={actionLoading || !connection}
                            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm disabled:opacity-50 ${dark ? 'border-gray-700 text-gray-200 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Unlink2 size={16} />
                            Отключить
                        </button>
                    </div>

                    <div className={`rounded-xl border px-4 py-3 ${dark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                        <div className={`text-xs uppercase tracking-wider ${textMutedClass}`}>Как это работает</div>
                        <ol className={`mt-2 space-y-2 text-sm ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
                            <li>1. Нажмите кнопку генерации ссылки.</li>
                            <li>2. Откройте Telegram-бота по ссылке и отправьте `/start`.</li>
                            <li>3. После подтверждения ваш чат попадёт в рассылки по вашей роли.</li>
                        </ol>
                    </div>

                    <input
                        readOnly
                        value={deepLink}
                        className={`sr-only ${inputBgClass}`}
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                </div>
            )}
        </section>
    );
}
