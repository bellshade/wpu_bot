-- CreateTable
CREATE TABLE `point` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ketua_id` VARCHAR(191) NOT NULL,
    `ketua_name` VARCHAR(255) NULL,
    `ketua_point` INTEGER NOT NULL,
    `author_name` VARCHAR(255) NULL,
    `author_id` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `point_ketua_id_key`(`ketua_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
