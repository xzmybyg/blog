ALTER TABLE `user`
  MODIFY COLUMN `password` VARCHAR(255) NOT NULL COMMENT '密码哈希';

CREATE TABLE IF NOT EXISTS `password_reset_token` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `code_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `consumed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_user_created` (`user_id`, `created_at`),
  KEY `idx_password_reset_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
