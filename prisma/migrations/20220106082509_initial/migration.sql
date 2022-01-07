-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `author_id` VARCHAR(255) NULL,
    `channel_id` VARCHAR(255) NULL,
    `message_id` VARCHAR(255) NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    `messages` LONGTEXT NULL,
    `attachments` LONGTEXT NULL,
    `timestamp` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perkenalan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `message_id` VARCHAR(255) NULL,
    `message_content` LONGTEXT NULL,
    `nama` TEXT NULL,
    `asal` TEXT NULL,
    `sekolah` TEXT NULL,
    `bekerja` TEXT NULL,
    `referal` TEXT NULL,
    `favorite_programing_language` TEXT NULL,
    `hobby` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
