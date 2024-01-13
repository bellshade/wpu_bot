-- CreateTable
CREATE TABLE `helper_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` VARCHAR(255) NOT NULL,
    `added_by` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `helper_role_role_id_key`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
