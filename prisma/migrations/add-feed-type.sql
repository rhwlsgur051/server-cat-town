-- Add feed_type column to feeds (daily | health | question)
ALTER TABLE `feeds` ADD COLUMN `feed_type` VARCHAR(20) NOT NULL DEFAULT 'daily' AFTER `feed_image_url`;
