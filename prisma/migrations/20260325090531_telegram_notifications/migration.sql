
-- CreateTable
CREATE TABLE `telegram_connections` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `telegram_user_id` VARCHAR(191) NOT NULL,
    `chat_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `linked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `telegram_connections_user_id_key`(`user_id`),
    UNIQUE INDEX `telegram_connections_telegram_user_id_key`(`telegram_user_id`),
    UNIQUE INDEX `telegram_connections_chat_id_key`(`chat_id`),
    INDEX `telegram_connections_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `telegram_link_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `telegram_link_tokens_token_hash_key`(`token_hash`),
    INDEX `telegram_link_tokens_user_id_idx`(`user_id`),
    INDEX `telegram_link_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `telegram_notification_rules` (
    `id` VARCHAR(191) NOT NULL,
    `event_type` ENUM('ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'BATCH_STATUS_CHANGED', 'BATCH_ACCEPTANCE_FINISHED', 'ITEM_REJECTED', 'COLLECTION_REQUEST_CREATED', 'COLLECTION_REQUEST_STATUS_CHANGED', 'ITEM_ALLOCATED') NOT NULL,
    `target_role` ENUM('ADMIN', 'MANAGER', 'SALES_MANAGER', 'FRANCHISEE', 'ALL_STAFF') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `message_template` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `telegram_notification_rules_target_role_idx`(`target_role`),
    UNIQUE INDEX `telegram_notification_rules_event_type_target_role_key`(`event_type`, `target_role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `telegram_connections` ADD CONSTRAINT `telegram_connections_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `telegram_link_tokens` ADD CONSTRAINT `telegram_link_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
