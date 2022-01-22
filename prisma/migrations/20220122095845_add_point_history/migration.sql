-- CreateTable
CREATE TABLE `point_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `point_id` BIGINT NOT NULL,
    `change` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `author_id` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `point_history` ADD CONSTRAINT `point_history_point_id_fkey` FOREIGN KEY (`point_id`) REFERENCES `point`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
