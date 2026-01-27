-- Manual Migration for Cat Town Database
-- Run this SQL in MySQL Workbench

USE cat_town;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `user_no` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(50) NOT NULL,
  `user_email` VARCHAR(100) NOT NULL,
  `user_pwd` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_no`),
  UNIQUE KEY `users_user_id_key` (`user_id`),
  UNIQUE KEY `users_user_email_key` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cats table
CREATE TABLE IF NOT EXISTS `cats` (
  `cat_no` INT NOT NULL AUTO_INCREMENT,
  `cat_name` VARCHAR(50) NOT NULL,
  `cat_birth` VARCHAR(10) NOT NULL,
  `cat_gender` VARCHAR(10) NOT NULL,
  `cat_breed` VARCHAR(50) NOT NULL,
  `user_no` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`cat_no`),
  KEY `cats_user_no_idx` (`user_no`),
  CONSTRAINT `cats_user_no_fkey` FOREIGN KEY (`user_no`) REFERENCES `users` (`user_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
