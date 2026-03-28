import type { NotificationEventType, NotificationRoleTarget, Role } from '@prisma/client';

type EventCatalogEntry = {
    key: NotificationEventType;
    label: string;
    description: string;
    placeholders: string[];
};

type TargetCatalogEntry = {
    key: NotificationRoleTarget;
    label: string;
    description: string;
};

export const TELEGRAM_PLACEHOLDER_HELP: Array<{ key: string; label: string }> = [
    { key: 'event', label: 'Название события' },
    { key: 'actor_name', label: 'Кто инициировал действие' },
    { key: 'timestamp', label: 'Время события' },
    { key: 'order_id', label: 'ID заказа' },
    { key: 'order_status', label: 'Статус заказа' },
    { key: 'customer_name', label: 'Покупатель' },
    { key: 'total', label: 'Сумма заказа' },
    { key: 'delivery_address', label: 'Адрес доставки' },
    { key: 'batch_id', label: 'ID партии' },
    { key: 'batch_status', label: 'Статус партии' },
    { key: 'owner_name', label: 'Владелец партии' },
    { key: 'item_id', label: 'ID item' },
    { key: 'temp_id', label: 'Временный ID item' },
    { key: 'item_status', label: 'Статус item' },
    { key: 'reason', label: 'Причина отклонения' },
    { key: 'request_id', label: 'ID заявки на сбор' },
    { key: 'request_status', label: 'Статус заявки на сбор' },
    { key: 'title', label: 'Заголовок заявки' },
    { key: 'target_user_name', label: 'Назначенный франчайзи' }
];

export const TELEGRAM_EVENT_CATALOG: EventCatalogEntry[] = [
    {
        key: 'ORDER_CREATED',
        label: 'Новый заказ',
        description: 'Создание нового интернет-заказа',
        placeholders: ['event', 'actor_name', 'timestamp', 'order_id', 'customer_name', 'total', 'delivery_address']
    },
    {
        key: 'ORDER_STATUS_CHANGED',
        label: 'Статус заказа изменён',
        description: 'Переход заказа в новый статус',
        placeholders: ['event', 'actor_name', 'timestamp', 'order_id', 'order_status', 'customer_name', 'total']
    },
    {
        key: 'BATCH_STATUS_CHANGED',
        label: 'Статус партии изменён',
        description: 'Партия отправлена, получена или завершена',
        placeholders: ['event', 'actor_name', 'timestamp', 'batch_id', 'batch_status', 'owner_name']
    },
    {
        key: 'BATCH_ACCEPTANCE_FINISHED',
        label: 'Приёмка партии завершена',
        description: 'HQ завершил приёмку партии',
        placeholders: ['event', 'actor_name', 'timestamp', 'batch_id', 'batch_status', 'owner_name']
    },
    {
        key: 'ITEM_REJECTED',
        label: 'Item отклонён',
        description: 'Во время приёмки item был отклонён',
        placeholders: ['event', 'actor_name', 'timestamp', 'batch_id', 'item_id', 'temp_id', 'item_status', 'reason']
    },
    {
        key: 'COLLECTION_REQUEST_CREATED',
        label: 'Новая заявка на сбор',
        description: 'Создана заявка HQ на сбор партии',
        placeholders: ['event', 'actor_name', 'timestamp', 'request_id', 'title', 'target_user_name']
    },
    {
        key: 'COLLECTION_REQUEST_STATUS_CHANGED',
        label: 'Статус заявки на сбор изменён',
        description: 'Изменился статус заявки HQ на сбор партии',
        placeholders: ['event', 'actor_name', 'timestamp', 'request_id', 'request_status', 'title', 'target_user_name']
    },
    {
        key: 'ITEM_ALLOCATED',
        label: 'Item распределён',
        description: 'Item назначен в канал продаж',
        placeholders: ['event', 'actor_name', 'timestamp', 'item_id', 'temp_id', 'item_status', 'owner_name']
    }
];

export const TELEGRAM_TARGET_CATALOG: TargetCatalogEntry[] = [
    { key: 'ADMIN', label: 'Админы', description: 'Только роль ADMIN' },
    { key: 'MANAGER', label: 'Менеджеры', description: 'Только роль MANAGER' },
    { key: 'SALES_MANAGER', label: 'Продажи', description: 'Только роль SALES_MANAGER' },
    { key: 'FRANCHISEE', label: 'Партнёры', description: 'Только роль FRANCHISEE' },
    { key: 'ALL_STAFF', label: 'Все кроме клиентов', description: 'ADMIN + MANAGER + SALES_MANAGER + FRANCHISEE' }
];

export const TELEGRAM_ROLE_TARGETS: Record<NotificationRoleTarget, Role[]> = {
    ADMIN: ['ADMIN'],
    MANAGER: ['MANAGER'],
    SALES_MANAGER: ['SALES_MANAGER'],
    FRANCHISEE: ['FRANCHISEE'],
    ALL_STAFF: ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FRANCHISEE']
};

export const TELEGRAM_DIRECT_TARGET_PRIORITY: Record<NotificationRoleTarget, number> = {
    ADMIN: 10,
    MANAGER: 10,
    SALES_MANAGER: 10,
    FRANCHISEE: 10,
    ALL_STAFF: 1
};

export const DEFAULT_TELEGRAM_RULES: Array<{
    event_type: NotificationEventType;
    target_role: NotificationRoleTarget;
    enabled: boolean;
    message_template: string;
}> = [
    {
        event_type: 'ORDER_CREATED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Новый заказ {{order_id}}\nПокупатель: {{customer_name}}\nСумма: {{total}}\nАдрес: {{delivery_address}}\nИнициатор: {{actor_name}}\nВремя: {{timestamp}}'
    },
    {
        event_type: 'ORDER_CREATED',
        target_role: 'MANAGER',
        enabled: false,
        message_template: 'Новый заказ {{order_id}}\nПокупатель: {{customer_name}}\nСумма: {{total}}\nАдрес: {{delivery_address}}'
    },
    {
        event_type: 'ORDER_CREATED',
        target_role: 'SALES_MANAGER',
        enabled: true,
        message_template: 'Новый заказ {{order_id}}\nПокупатель: {{customer_name}}\nСумма: {{total}}\nАдрес: {{delivery_address}}'
    },
    {
        event_type: 'ORDER_CREATED',
        target_role: 'FRANCHISEE',
        enabled: false,
        message_template: 'Новый заказ {{order_id}}\nПокупатель: {{customer_name}}\nСумма: {{total}}\nАдрес: {{delivery_address}}'
    },
    {
        event_type: 'ORDER_CREATED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Новый заказ {{order_id}}\nПокупатель: {{customer_name}}\nСумма: {{total}}\nАдрес: {{delivery_address}}'
    },
    {
        event_type: 'ORDER_STATUS_CHANGED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Заказ {{order_id}} переведён в статус {{order_status}}\nПокупатель: {{customer_name}}\nСумма: {{total}}\nИзменил: {{actor_name}}\nВремя: {{timestamp}}'
    },
    {
        event_type: 'ORDER_STATUS_CHANGED',
        target_role: 'MANAGER',
        enabled: false,
        message_template: 'Заказ {{order_id}} переведён в статус {{order_status}}\nПокупатель: {{customer_name}}\nСумма: {{total}}'
    },
    {
        event_type: 'ORDER_STATUS_CHANGED',
        target_role: 'SALES_MANAGER',
        enabled: true,
        message_template: 'Заказ {{order_id}} переведён в статус {{order_status}}\nПокупатель: {{customer_name}}\nСумма: {{total}}'
    },
    {
        event_type: 'ORDER_STATUS_CHANGED',
        target_role: 'FRANCHISEE',
        enabled: false,
        message_template: 'Заказ {{order_id}} переведён в статус {{order_status}}\nПокупатель: {{customer_name}}\nСумма: {{total}}'
    },
    {
        event_type: 'ORDER_STATUS_CHANGED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Заказ {{order_id}} переведён в статус {{order_status}}\nПокупатель: {{customer_name}}\nСумма: {{total}}'
    },
    {
        event_type: 'BATCH_STATUS_CHANGED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Партия {{batch_id}} изменила статус на {{batch_status}}\nВладелец: {{owner_name}}\nИнициатор: {{actor_name}}\nВремя: {{timestamp}}'
    },
    {
        event_type: 'BATCH_STATUS_CHANGED',
        target_role: 'MANAGER',
        enabled: true,
        message_template: 'Партия {{batch_id}} изменила статус на {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_STATUS_CHANGED',
        target_role: 'SALES_MANAGER',
        enabled: false,
        message_template: 'Партия {{batch_id}} изменила статус на {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_STATUS_CHANGED',
        target_role: 'FRANCHISEE',
        enabled: true,
        message_template: 'Партия {{batch_id}} изменила статус на {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_STATUS_CHANGED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Партия {{batch_id}} изменила статус на {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_ACCEPTANCE_FINISHED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Приёмка партии {{batch_id}} завершена\nИтоговый статус: {{batch_status}}\nВладелец: {{owner_name}}\nИнициатор: {{actor_name}}'
    },
    {
        event_type: 'BATCH_ACCEPTANCE_FINISHED',
        target_role: 'MANAGER',
        enabled: true,
        message_template: 'Приёмка партии {{batch_id}} завершена\nИтоговый статус: {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_ACCEPTANCE_FINISHED',
        target_role: 'SALES_MANAGER',
        enabled: false,
        message_template: 'Приёмка партии {{batch_id}} завершена\nИтоговый статус: {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_ACCEPTANCE_FINISHED',
        target_role: 'FRANCHISEE',
        enabled: true,
        message_template: 'Приёмка партии {{batch_id}} завершена\nИтоговый статус: {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'BATCH_ACCEPTANCE_FINISHED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Приёмка партии {{batch_id}} завершена\nИтоговый статус: {{batch_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'ITEM_REJECTED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Item {{temp_id}} ({{item_id}}) отклонён\nПартия: {{batch_id}}\nПричина: {{reason}}\nИнициатор: {{actor_name}}'
    },
    {
        event_type: 'ITEM_REJECTED',
        target_role: 'MANAGER',
        enabled: true,
        message_template: 'Item {{temp_id}} ({{item_id}}) отклонён\nПартия: {{batch_id}}\nПричина: {{reason}}'
    },
    {
        event_type: 'ITEM_REJECTED',
        target_role: 'SALES_MANAGER',
        enabled: false,
        message_template: 'Item {{temp_id}} ({{item_id}}) отклонён\nПартия: {{batch_id}}\nПричина: {{reason}}'
    },
    {
        event_type: 'ITEM_REJECTED',
        target_role: 'FRANCHISEE',
        enabled: true,
        message_template: 'Item {{temp_id}} ({{item_id}}) отклонён\nПартия: {{batch_id}}\nПричина: {{reason}}'
    },
    {
        event_type: 'ITEM_REJECTED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Item {{temp_id}} ({{item_id}}) отклонён\nПартия: {{batch_id}}\nПричина: {{reason}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_CREATED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Новая заявка на сбор {{request_id}}\n{{title}}\nНазначено: {{target_user_name}}\nИнициатор: {{actor_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_CREATED',
        target_role: 'MANAGER',
        enabled: true,
        message_template: 'Новая заявка на сбор {{request_id}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_CREATED',
        target_role: 'SALES_MANAGER',
        enabled: false,
        message_template: 'Новая заявка на сбор {{request_id}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_CREATED',
        target_role: 'FRANCHISEE',
        enabled: true,
        message_template: 'Новая заявка на сбор {{request_id}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_CREATED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Новая заявка на сбор {{request_id}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_STATUS_CHANGED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Заявка на сбор {{request_id}} обновлена\nСтатус: {{request_status}}\n{{title}}\nНазначено: {{target_user_name}}\nИнициатор: {{actor_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_STATUS_CHANGED',
        target_role: 'MANAGER',
        enabled: true,
        message_template: 'Заявка на сбор {{request_id}} обновлена\nСтатус: {{request_status}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_STATUS_CHANGED',
        target_role: 'SALES_MANAGER',
        enabled: false,
        message_template: 'Заявка на сбор {{request_id}} обновлена\nСтатус: {{request_status}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_STATUS_CHANGED',
        target_role: 'FRANCHISEE',
        enabled: true,
        message_template: 'Заявка на сбор {{request_id}} обновлена\nСтатус: {{request_status}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'COLLECTION_REQUEST_STATUS_CHANGED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Заявка на сбор {{request_id}} обновлена\nСтатус: {{request_status}}\n{{title}}\nНазначено: {{target_user_name}}'
    },
    {
        event_type: 'ITEM_ALLOCATED',
        target_role: 'ADMIN',
        enabled: true,
        message_template: 'Item {{temp_id}} ({{item_id}}) распределён\nНовый статус: {{item_status}}\nВладелец: {{owner_name}}\nИнициатор: {{actor_name}}'
    },
    {
        event_type: 'ITEM_ALLOCATED',
        target_role: 'MANAGER',
        enabled: true,
        message_template: 'Item {{temp_id}} ({{item_id}}) распределён\nНовый статус: {{item_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'ITEM_ALLOCATED',
        target_role: 'SALES_MANAGER',
        enabled: false,
        message_template: 'Item {{temp_id}} ({{item_id}}) распределён\nНовый статус: {{item_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'ITEM_ALLOCATED',
        target_role: 'FRANCHISEE',
        enabled: true,
        message_template: 'Item {{temp_id}} ({{item_id}}) распределён\nНовый статус: {{item_status}}\nВладелец: {{owner_name}}'
    },
    {
        event_type: 'ITEM_ALLOCATED',
        target_role: 'ALL_STAFF',
        enabled: false,
        message_template: 'Item {{temp_id}} ({{item_id}}) распределён\nНовый статус: {{item_status}}\nВладелец: {{owner_name}}'
    }
];

export const getEventLabel = (eventType: NotificationEventType): string => {
    return TELEGRAM_EVENT_CATALOG.find((item) => item.key === eventType)?.label || eventType;
};
