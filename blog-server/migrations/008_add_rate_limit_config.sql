CREATE TABLE IF NOT EXISTS `rate_limit_config` (
  `rule_key` varchar(32) NOT NULL COMMENT '限流规则标识',
  `max_requests` int unsigned NOT NULL COMMENT '统计窗口内最大请求数',
  `window_ms` bigint unsigned NOT NULL COMMENT '统计窗口（毫秒）',
  `updated_by` int DEFAULT NULL COMMENT '最后修改用户 ID',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rule_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
