-- CreateTable
CREATE TABLE `feeds` (
    `feed_no` INTEGER NOT NULL AUTO_INCREMENT,
    `feed_content` TEXT NOT NULL,
    `feed_image_url` VARCHAR(500) NULL,
    `feed_likes` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_no` INTEGER NOT NULL,

    INDEX `feeds_user_no_idx`(`user_no`),
    INDEX `feeds_created_at_idx`(`created_at`),
    PRIMARY KEY (`feed_no`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `feeds` ADD CONSTRAINT `feeds_user_no_fkey` FOREIGN KEY (`user_no`) REFERENCES `users`(`user_no`) ON DELETE CASCADE ON UPDATE CASCADE;
