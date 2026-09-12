-- 若下面的查询返回记录，请先确认并处理重复账号，再执行 ALTER TABLE。
SELECT username, COUNT(*) AS duplicate_count
FROM `user`
GROUP BY username
HAVING COUNT(*) > 1;

ALTER TABLE `user`
  ADD UNIQUE KEY `uq_user_username` (`username`);
