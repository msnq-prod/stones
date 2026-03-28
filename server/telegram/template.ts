const EMPTY_PLACEHOLDER_VALUE = '—';

const normalizeValue = (value: unknown): string => {
    if (value == null) return EMPTY_PLACEHOLDER_VALUE;
    if (typeof value === 'number') return Number.isFinite(value) ? value.toString() : EMPTY_PLACEHOLDER_VALUE;
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';

    const text = String(value).trim();
    return text.length > 0 ? text : EMPTY_PLACEHOLDER_VALUE;
};

export const renderTelegramTemplate = (
    template: string,
    context: Record<string, unknown>
): string => {
    const source = template.trim();
    if (!source) {
        return EMPTY_PLACEHOLDER_VALUE;
    }

    return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
        return normalizeValue(context[key]);
    });
};
