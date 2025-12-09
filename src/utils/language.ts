
export const getLocalizedValue = (obj: any, field: string, langId: number): string => {
    if (!obj) return '';
    if (langId === 1) return obj[field];
    return obj[`${field}_${langId}`] || obj[field] || '';
};
