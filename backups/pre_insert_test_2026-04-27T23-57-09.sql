-- Pre-insert backup
-- Date: 2026-04-27T23:57:11.023Z

DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'staff',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `timezone` varchar(20) DEFAULT 'Asia/Shanghai',
  `can_view_recipes` tinyint(1) DEFAULT '0',
  `api_token` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=120001;

INSERT INTO users VALUES (1, "admin", "戴瑞冬", "$2b$10$KCiyh3WMTkXu2yhiG087e.ucP/QIS1wP5T.HMSNGn5GOnmPyfRNkC", "admin", "2026-03-24T07:00:11.000Z", "Asia/Shanghai", 1, NULL);
INSERT INTO users VALUES (30001, "test", "test", "$2b$10$2SOgg3gJG8uDITS4pkVsiOeb8YvaxBKKnDsN0Jc6zpru235veAG86", "staff", "2026-03-26T03:16:01.000Z", "Asia/Shanghai", 0, NULL);
INSERT INTO users VALUES (60001, "llm", "AI Assistant", "$2b$10$BFu/tq.5w1hl7qqbqihoa.6vd5vVwEnw8nGMPul2awyfC/BSspbTS", "manager", "2026-04-27T00:44:36.000Z", "Asia/Shanghai", 1, "bakery_llm_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6");
INSERT INTO users VALUES (90001, "test_user_1777334076602", "测试用户", "hashed_password", "staff", "2026-04-27T23:54:37.000Z", "Asia/Shanghai", 0, NULL);
