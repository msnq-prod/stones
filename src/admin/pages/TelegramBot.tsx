import { useEffect, useMemo, useState } from 'react';
import type { NotificationEventType, NotificationRoleTarget, TelegramNotificationRule } from '@prisma/client';
import { Bot, Save } from 'lucide-react';
import { TelegramLinkCard } from '../../components/TelegramLinkCard';
import { authFetch } from '../../utils/authFetch';

type TelegramStatus = {
    configured: boolean;
    ready: boolean;
    bot_username: string | null;
    counts: null | Record<'ADMIN' | 'MANAGER' | 'SALES_MANAGER' | 'FRANCHISEE', number>;
};

type CatalogPayload = {
    rules: TelegramNotificationRule[];
    catalog: {
        events: Array<{
            key: NotificationEventType;
            label: string;
            description: string;
            placeholders: string[];
        }>;
        targets: Array<{
            key: NotificationRoleTarget;
            label: string;
            description: string;
        }>;
        placeholders: Array<{
            key: string;
            label: string;
        }>;
    };
};

type RuleDraft = {
    enabled: boolean;
    message_template: string;
};

const INITIAL_CATALOG: CatalogPayload['catalog'] = {
    events: [],
    targets: [],
    placeholders: []
};

export function TelegramBot() {
    const [status, setStatus] = useState<TelegramStatus | null>(null);
    const [rules, setRules] = useState<TelegramNotificationRule[]>([]);
    const [catalog, setCatalog] = useState<CatalogPayload['catalog']>(INITIAL_CATALOG);
    const [drafts, setDrafts] = useState<Record<string, RuleDraft>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingRuleId, setSavingRuleId] = useState('');
    const [eventFilter, setEventFilter] = useState<'ALL' | NotificationEventType>('ALL');
    const [targetFilter, setTargetFilter] = useState<'ALL' | NotificationRoleTarget>('ALL');

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [statusResponse, rulesResponse] = await Promise.all([
                authFetch('/api/telegram/status'),
                authFetch('/api/telegram/rules')
            ]);

            if (!statusResponse.ok) {
                const payload = await statusResponse.json().catch(() => ({ error: 'Не удалось загрузить статус бота.' }));
                throw new Error(payload.error || 'Не удалось загрузить статус бота.');
            }

            if (!rulesResponse.ok) {
                const payload = await rulesResponse.json().catch(() => ({ error: 'Не удалось загрузить правила уведомлений.' }));
                throw new Error(payload.error || 'Не удалось загрузить правила уведомлений.');
            }

            const statusPayload = await statusResponse.json() as TelegramStatus;
            const rulesPayload = await rulesResponse.json() as CatalogPayload;
            setStatus(statusPayload);
            setRules(rulesPayload.rules);
            setCatalog(rulesPayload.catalog);
            setDrafts(
                Object.fromEntries(
                    rulesPayload.rules.map((rule) => [
                        rule.id,
                        {
                            enabled: rule.enabled,
                            message_template: rule.message_template
                        }
                    ])
                )
            );
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить Telegram-настройки.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const filteredRules = useMemo(() => {
        return rules.filter((rule) => {
            if (eventFilter !== 'ALL' && rule.event_type !== eventFilter) {
                return false;
            }
            if (targetFilter !== 'ALL' && rule.target_role !== targetFilter) {
                return false;
            }
            return true;
        });
    }, [eventFilter, rules, targetFilter]);

    const placeholderLookup = useMemo(() => {
        return new Map(catalog.placeholders.map((placeholder) => [placeholder.key, placeholder.label]));
    }, [catalog.placeholders]);

    const handleDraftChange = (ruleId: string, patch: Partial<RuleDraft>) => {
        setDrafts((prev) => ({
            ...prev,
            [ruleId]: {
                ...prev[ruleId],
                ...patch
            }
        }));
    };

    const handleSaveRule = async (ruleId: string) => {
        const draft = drafts[ruleId];
        if (!draft) {
            return;
        }

        setSavingRuleId(ruleId);
        setError('');

        try {
            const response = await authFetch(`/api/telegram/rules/${ruleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(draft)
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({ error: 'Не удалось сохранить правило.' }));
                throw new Error(payload.error || 'Не удалось сохранить правило.');
            }

            const updated = await response.json() as TelegramNotificationRule;
            setRules((prev) => prev.map((rule) => rule.id === updated.id ? updated : rule));
            setDrafts((prev) => ({
                ...prev,
                [updated.id]: {
                    enabled: updated.enabled,
                    message_template: updated.message_template
                }
            }));
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить правило.');
        } finally {
            setSavingRuleId('');
        }
    };

    const getEventMeta = (eventType: NotificationEventType) => {
        return catalog.events.find((eventItem) => eventItem.key === eventType);
    };

    const getTargetMeta = (targetRole: NotificationRoleTarget) => {
        return catalog.targets.find((targetItem) => targetItem.key === targetRole);
    };

    if (loading) {
        return <div className="text-gray-400">Загрузка Telegram-настроек...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-300">
                            <Bot size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Бот в ТГ</h1>
                            <p className="mt-1 text-sm text-gray-400">
                                Управление Telegram-уведомлениями по ролям и событиям системы.
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => void loadData()}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                >
                    Обновить
                </button>
            </header>

            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <MetricCard
                            title="Статус бота"
                            value={status?.configured ? (status.ready ? 'Активен' : 'Есть токен') : 'Не настроен'}
                            description={status?.configured
                                ? `Username: @${status.bot_username || 'unknown'}`
                                : 'Нужен TELEGRAM_BOT_TOKEN в .env'}
                        />
                        <MetricCard
                            title="Привязано админов"
                            value={String(status?.counts?.ADMIN || 0)}
                            description="Активные Telegram-привязки"
                        />
                        <MetricCard
                            title="Привязано менеджеров"
                            value={String(status?.counts?.MANAGER || 0)}
                            description="Активные Telegram-привязки"
                        />
                        <MetricCard
                            title="Привязано продаж"
                            value={String(status?.counts?.SALES_MANAGER || 0)}
                            description="Активные Telegram-привязки"
                        />
                        <MetricCard
                            title="Привязано партнёров"
                            value={String(status?.counts?.FRANCHISEE || 0)}
                            description="Активные Telegram-привязки"
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Матрица уведомлений</h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Включайте события для ролей и редактируйте текст сообщений.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <select
                                    value={eventFilter}
                                    onChange={(e) => setEventFilter(e.target.value as 'ALL' | NotificationEventType)}
                                    className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
                                >
                                    <option value="ALL">Все события</option>
                                    {catalog.events.map((eventItem) => (
                                        <option key={eventItem.key} value={eventItem.key}>{eventItem.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={targetFilter}
                                    onChange={(e) => setTargetFilter(e.target.value as 'ALL' | NotificationRoleTarget)}
                                    className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
                                >
                                    <option value="ALL">Все получатели</option>
                                    {catalog.targets.map((targetItem) => (
                                        <option key={targetItem.key} value={targetItem.key}>{targetItem.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            {filteredRules.map((rule) => {
                                const draft = drafts[rule.id];
                                const eventMeta = getEventMeta(rule.event_type);
                                const targetMeta = getTargetMeta(rule.target_role);
                                return (
                                    <article key={rule.id} className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200">
                                                        {eventMeta?.label || rule.event_type}
                                                    </span>
                                                    <span className="rounded-full border border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-300">
                                                        {targetMeta?.label || rule.target_role}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    {eventMeta?.description || 'Описание события недоступно.'}
                                                </p>
                                            </div>
                                            <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={draft?.enabled || false}
                                                    onChange={(e) => handleDraftChange(rule.id, { enabled: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                                                />
                                                Включено
                                            </label>
                                        </div>

                                        <div className="mt-4">
                                            <textarea
                                                value={draft?.message_template || ''}
                                                onChange={(e) => handleDraftChange(rule.id, { message_template: e.target.value })}
                                                rows={5}
                                                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                            <div>
                                                <div className="text-xs uppercase tracking-wider text-gray-500">Доступные placeholders</div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {(eventMeta?.placeholders || []).map((placeholder) => (
                                                        <span key={`${rule.id}-${placeholder}`} className="rounded-full border border-gray-700 bg-gray-900 px-2.5 py-1 text-xs text-gray-300">
                                                            {`{{${placeholder}}}`} {placeholderLookup.get(placeholder) ? `· ${placeholderLookup.get(placeholder)}` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => void handleSaveRule(rule.id)}
                                                disabled={savingRuleId === rule.id}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                                            >
                                                <Save size={16} />
                                                {savingRuleId === rule.id ? 'Сохранение...' : 'Сохранить'}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}

                            {filteredRules.length === 0 && (
                                <div className="rounded-xl border border-dashed border-gray-700 px-4 py-8 text-center text-sm text-gray-500">
                                    Нет правил под выбранные фильтры.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <TelegramLinkCard theme="dark" />

                    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <h2 className="text-lg font-semibold text-white">Кому доступны уведомления</h2>
                        <div className="mt-4 space-y-3">
                            {catalog.targets.map((targetItem) => (
                                <div key={targetItem.key} className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3">
                                    <div className="text-sm font-medium text-white">{targetItem.label}</div>
                                    <div className="mt-1 text-sm text-gray-400">{targetItem.description}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function MetricCard({ title, value, description }: { title: string; value: string; description: string }) {
    return (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="mt-3 text-2xl font-bold text-white">{value}</div>
            <div className="mt-2 text-sm text-gray-400">{description}</div>
        </div>
    );
}
