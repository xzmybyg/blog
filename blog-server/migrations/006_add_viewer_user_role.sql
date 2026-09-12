ALTER TABLE `user`
  MODIFY COLUMN `role` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci
  NULL DEFAULT 'user' COMMENT '用户身份：admin/viewer/user';
