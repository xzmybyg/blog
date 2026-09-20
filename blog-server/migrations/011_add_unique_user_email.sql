-- 执行唯一索引前先检查历史重复邮箱。若查询有结果，请先人工确认并合并重复账号。
SELECT LOWER(TRIM(`email`)) AS `normalized_email`, COUNT(*) AS `duplicate_count`
FROM `user`
GROUP BY LOWER(TRIM(`email`))
HAVING COUNT(*) > 1;

ALTER TABLE `user`
  ADD UNIQUE KEY `uq_user_email` (`email`);
