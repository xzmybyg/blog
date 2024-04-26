/*
 Navicat Premium Data Transfer

 Source Server         : blogdata
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : blogdata

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 26/04/2024 14:31:31
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '文章标题',
  `description` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '文章描述',
  `article` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '文章路径',
  `label` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '标签分类',
  `topping` int NULL DEFAULT 0 COMMENT '是否置顶',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `banner` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '404' COMMENT '文章封面',
  `hidden` int NULL DEFAULT 0 COMMENT '是否隐藏',
  `visits` int UNSIGNED NULL DEFAULT 0 COMMENT '浏览量',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of article
-- ----------------------------
INSERT INTO `article` VALUES (1, '博客搭建', '本站搭建说明:前端使用React、Vite、Ant Design搭建，后端使用Express搭建，数据库使用MySQL。', 'Blog搭建', '博客', 0, '2024-01-21 04:28:06', '404', 0, 0);
INSERT INTO `article` VALUES (2, 'TS教程', NULL, 'TS', 'TypeScript', 0, '2024-01-18 04:32:57', '404', 0, 0);

-- ----------------------------
-- Table structure for blog
-- ----------------------------
DROP TABLE IF EXISTS `blog`;
CREATE TABLE `blog`  (
  `id` int NOT NULL,
  `notice` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `visits` int NULL DEFAULT 0,
  `createDate` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of blog
-- ----------------------------

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL COMMENT '评论文章',
  `user_id` int NOT NULL COMMENT '评论用户',
  `content` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '评论内容',
  `like` int NOT NULL DEFAULT 0 COMMENT '点赞数',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '评论时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment
-- ----------------------------
INSERT INTO `comment` VALUES (1, 1, 8, '1', 0, '2024-01-19 14:42:15');
INSERT INTO `comment` VALUES (2, 1, 8, '2', 0, '2024-01-19 14:43:29');
INSERT INTO `comment` VALUES (3, 1, 16, '5', 0, '2024-01-19 15:36:17');

-- ----------------------------
-- Table structure for label
-- ----------------------------
DROP TABLE IF EXISTS `label`;
CREATE TABLE `label`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '标签名',
  `color` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '#108ee9' COMMENT '颜色',
  `createTime` date NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of label
-- ----------------------------

-- ----------------------------
-- Table structure for link
-- ----------------------------
DROP TABLE IF EXISTS `link`;
CREATE TABLE `link`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '友链名称',
  `url` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '友链地址',
  `describe` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '友链描述',
  `logo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '友链头像',
  `state` int NOT NULL DEFAULT 0 COMMENT '审核状态',
  `applyTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of link
-- ----------------------------

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '留言内容',
  `user_id` int NOT NULL COMMENT '用户id',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '留言时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of message
-- ----------------------------
INSERT INTO `message` VALUES (1, '欢迎来到我的博客', 1, '2024-01-18 04:35:17');
INSERT INTO `message` VALUES (2, '革命尚未成功，同志仍需努力', 8, '2024-01-19 15:24:07');
INSERT INTO `message` VALUES (3, '嗨~看得见我吗', 16, '2024-01-19 15:37:22');
INSERT INTO `message` VALUES (4, '看不到', 8, '2024-01-19 15:40:19');
INSERT INTO `message` VALUES (5, '感觉好高级', 19, '2024-01-21 13:28:36');

-- ----------------------------
-- Table structure for reply
-- ----------------------------
DROP TABLE IF EXISTS `reply`;
CREATE TABLE `reply`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `like` int UNSIGNED NULL DEFAULT 0,
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `reply_user_id` int NOT NULL,
  `reply_comment_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reply
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '用户名',
  `role` char(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'user' COMMENT '用户身份',
  `password` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '密码',
  `nickname` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '头像',
  `email` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '邮箱',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `commentLimit` int NULL DEFAULT 1 COMMENT '是否允许评论',
  `ip` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `location` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '城市',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '1277215827', 'admin', 'lcyzs', '心中没有白月光', '/blog-icon.jpg', '1277215827@qq.com', '2024-01-18 04:34:03', 1, NULL, NULL);
INSERT INTO `user` VALUES (8, 'gd_miaoning', 'user', '12345678', '顾得MiaoNing', NULL, '987226220@qq.com', '2024-01-19 10:49:22', 1, NULL, NULL);
INSERT INTO `user` VALUES (16, 'GaGa027', 'user', 'WXY20030720', 'GaGa', '/gaga.jpg', '2287538560@qq.com', '2024-01-19 15:33:00', 1, NULL, NULL);
INSERT INTO `user` VALUES (19, '2770206937', 'user', 'luocx040906', NULL, NULL, '2770206937@qq.com', '2024-01-21 13:28:30', 1, NULL, NULL);
INSERT INTO `user` VALUES (20, '13396390314', 'user', '996110ppl', NULL, NULL, '2728301240@qq.com', '2024-01-30 00:27:00', 1, NULL, NULL);
INSERT INTO `user` VALUES (21, '13396390314', 'user', '996110ppl', NULL, NULL, '2728301240@qq.com', '2024-01-30 00:33:24', 1, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
