-- Bakery App Database Backup
-- Date: 2026-03-30 21:25:30
-- Database: bakery
-- Tables: doughs, ingredients, materials, mixing_machines, mixing_records, preparation_ingredients, preparation_recipes, preparations, products, recipe_ingredients_archive, recipe_ingredients_current, recipe_versions, recipes, users, workday_slots, workflow_templates



-- Table: doughs
DROP TABLE IF EXISTS `doughs`;
CREATE TABLE `doughs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `material_id` int DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=150001;
INSERT INTO `doughs` (id, name, material_id, description) VALUES (3, '日式贝果', 22, NULL);
INSERT INTO `doughs` (id, name, material_id, description) VALUES (60001, '越南法棍', 60001, NULL);
INSERT INTO `doughs` (id, name, material_id, description) VALUES (90001, '盐可颂', 90001, NULL);
INSERT INTO `doughs` (id, name, material_id, description) VALUES (90002, '碱水面团', 90002, NULL);
INSERT INTO `doughs` (id, name, material_id, description) VALUES (120001, '脆皮越南法棍', 120001, NULL);
INSERT INTO `doughs` (id, name, material_id, description) VALUES (120002, '甜面团(直接法)', 120002, NULL);


-- Table: ingredients
DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `material_id` int DEFAULT NULL,
  `type` enum('flour','lipids','sugar','salt','leavening','dairy','protein','water','additive','others') DEFAULT 'others',
  `is_preparation` tinyint(1) DEFAULT '0',
  `default_unit` varchar(20) DEFAULT '%',
  `spec` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001;
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (2, '水', 1, 'water', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (3, '盐', 2, 'salt', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (4, '白砂糖', 3, 'sugar', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (5, '即发干酵母（耐高糖）', 4, 'leavening', 0, '%', '1kg', '32.00', '安琪');
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (6, '黄油', 5, 'lipids', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (7, '鸡蛋', 6, 'protein', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (8, '牛奶', 7, 'dairy', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (9, '全脂奶粉', 8, 'dairy', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (10, '海藻糖', 9, 'sugar', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (11, '麦芽精', 10, 'sugar', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (12, '橄榄油', 11, 'lipids', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (13, '蜂蜜', 12, 'sugar', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (14, '五得利910', 13, 'flour', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (15, '金顶焙麦芯小麦粉', 14, 'flour', 0, '%', '25kg', '230.00', '顶焙');
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (17, '伯爵野性T65', 15, 'flour', 0, '%', '25KG', '320.00', '王后');
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (90001, '脱脂奶粉', 16, 'dairy', 0, '%', NULL, NULL, NULL);
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (90002, '顶焙蛋糕粉', 17, 'flour', 0, '%', '25kg', '190.00', '顶焙');
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (90003, '顶焙精制面包粉', 18, 'flour', 0, '%', '25', '185.00', '顶焙');
INSERT INTO `ingredients` (id, name, material_id, type, is_preparation, default_unit, spec, price, manufacturer) VALUES (150001, '日式面包粉', 150001, 'flour', 0, '%', '25', '195.00', '顶焙');


-- Table: materials
DROP TABLE IF EXISTS `materials`;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('dough','ingredient','preparation') NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001;
INSERT INTO `materials` (id, name, type, created_at) VALUES (1, '水', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (2, '盐', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (3, '白砂糖', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (4, '即发干酵母（耐高糖）', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (5, '黄油', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (6, '鸡蛋', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (7, '牛奶', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (8, '全脂奶粉', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (9, '海藻糖', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (10, '麦芽精', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (11, '橄榄油', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (12, '蜂蜜', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (13, '五得利910', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (14, '金顶焙麦芯小麦粉', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (15, '伯爵野性T65', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (16, '脱脂奶粉', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (17, '顶焙蛋糕粉', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (18, '顶焙精制面包粉', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (19, '烫种(1:2)', 'ingredient', '2026-03-26 08:04:25');
INSERT INTO `materials` (id, name, type, created_at) VALUES (22, '日式贝果', 'dough', '2026-03-26 08:04:26');
INSERT INTO `materials` (id, name, type, created_at) VALUES (60001, '越南法棍', 'dough', '2026-03-26 09:36:56');
INSERT INTO `materials` (id, name, type, created_at) VALUES (90001, '盐可颂', 'dough', '2026-03-26 13:48:45');
INSERT INTO `materials` (id, name, type, created_at) VALUES (90002, '碱水面团', 'dough', '2026-03-26 13:53:00');
INSERT INTO `materials` (id, name, type, created_at) VALUES (120001, '脆皮越南法棍', 'dough', '2026-03-27 01:21:42');
INSERT INTO `materials` (id, name, type, created_at) VALUES (120002, '甜面团(直接法)', 'dough', '2026-03-27 01:27:13');
INSERT INTO `materials` (id, name, type, created_at) VALUES (150001, '日式面包粉', 'ingredient', '2026-03-30 07:04:07');


-- Table: mixing_machines
DROP TABLE IF EXISTS `mixing_machines`;
CREATE TABLE `mixing_machines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
INSERT INTO `mixing_machines` (id, name) VALUES (1, 'M40T');
INSERT INTO `mixing_machines` (id, name) VALUES (2, '乔立10L');
INSERT INTO `mixing_machines` (id, name) VALUES (3, '佳麦7L');


-- Table: mixing_records
DROP TABLE IF EXISTS `mixing_records`;
CREATE TABLE `mixing_records` (
  `batch_number` varchar(10) NOT NULL,
  `dough_name` varchar(100) NOT NULL,
  `dry_temp` decimal(4,1) DEFAULT NULL,
  `room_temp` decimal(4,1) DEFAULT NULL,
  `ice_ratio` decimal(3,2) DEFAULT NULL,
  `water_temp` decimal(4,1) DEFAULT NULL,
  `flour_amount` decimal(6,2) DEFAULT NULL,
  `water_amount` decimal(6,2) DEFAULT NULL,
  `dough_weight` decimal(6,2) DEFAULT NULL,
  `machine_speed` varchar(50) DEFAULT NULL,
  `gluten_level` decimal(3,2) DEFAULT NULL,
  `output_temp` decimal(4,1) DEFAULT NULL,
  `machine` varchar(50) DEFAULT NULL,
  `operator` varchar(50) DEFAULT NULL,
  `bulk_ferment_temp` decimal(4,1) DEFAULT NULL,
  `bulk_ferment_time` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `timezone` varchar(20) DEFAULT 'Asia/Shanghai',
  PRIMARY KEY (`batch_number`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032301', '越南法棍', '-5.0', '30.5', '0.00', '5.0', '1.50', '1.05', '2.40', 'LR2L5M2', NULL, '27.5', NULL, '戴瑞冬', '26.0', 60, '2026-03-23 02:43:22', '2026-03-23 02:43:22', 'Asia/Shanghai');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032401', '盐可颂', '16.0', '16.0', NULL, '16.0', '1.00', '0.65', '1.91', 'L4M3黄油L3M1', '8.50', '24.3', '乔立10L', '戴瑞冬', '26.0', 60, '2026-03-23 03:29:05', '2026-03-23 03:29:05', 'Asia/Shanghai');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032501', '盐可颂', '16.0', '16.0', NULL, '23.5', '1.00', '0.58', NULL, 'L3M3烫种L1M2.5黄油L3M1', '9.00', '27.5', '乔立10L', '戴瑞冬', '26.0', 35, '2026-03-25 07:31:02', '2026-03-25 07:46:20', 'Asia/Shanghai');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032502', '盐可颂', '18.0', '18.0', NULL, '18.0', '1.00', '0.58', NULL, 'L3M3烫种L1黄油L3M2.5', '8.50', '23.3', '乔立10L', '戴瑞冬', '30.0', 65, '2026-03-25 10:20:41', '2026-03-25 10:20:41', 'Asia/Shanghai');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032601', '越南法棍', '18.0', '18.0', NULL, '18.0', '1.00', '0.65', NULL, 'A30L1酵母奶粉白砂糖L1烫种L3盐L1', '9.00', '22.3', '乔立10L', '戴瑞冬', '26.0', 90, '2026-03-26 09:32:22', '2026-03-26 09:32:22', 'Asia/Shanghai');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032602', '日式贝果', '18.8', '18.8', NULL, '29.5', '1.00', '0.55', NULL, 'L8M1.5', '9.00', '26.8', 'M40T', '戴瑞冬', '3.0', 960, '2026-03-26 13:33:00', '2026-03-26 13:33:00', 'UTC');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032701', '脆皮越南法棍', '16.0', '16.0', NULL, '28.4', '1.00', '0.65', NULL, 'L3M1烫种L1黄油L3M0.5', '9.00', '26.5', 'M40T', '戴瑞冬', '60.0', 26, '2026-03-27 06:35:16', '2026-03-27 06:35:16', 'UTC');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032901', '碱水面团', '19.4', '19.4', NULL, '17.2', '1.00', '0.55', NULL, 'L8M1.5', '9.00', '25.3', 'M40T', '戴瑞冬', '26.0', 35, '2026-03-29 10:53:37', '2026-03-29 10:53:37', 'UTC');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032902', '碱水面团', '20.0', '20.0', NULL, '18.1', '1.00', '0.55', NULL, 'L8M1.5', '9.00', '25.8', 'M40T', '戴瑞冬', '25.8', 30, '2026-03-29 11:15:09', '2026-03-29 11:15:09', 'UTC');
INSERT INTO `mixing_records` (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp, flour_amount, water_amount, dough_weight, machine_speed, gluten_level, output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, created_at, updated_at, timezone) VALUES ('2026032903', '盐可颂', '19.8', '19.8', NULL, '18.5', '1.00', '0.58', NULL, 'L6烫种L2黄油L2M1.5', '9.00', '25.9', 'M40T', '戴瑞冬', '4.0', 960, '2026-03-29 15:01:53', '2026-03-29 15:01:53', 'UTC');


-- Table: preparation_ingredients
DROP TABLE IF EXISTS `preparation_ingredients`;
CREATE TABLE `preparation_ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `preparation_recipe_id` int NOT NULL,
  `ingredient_name` varchar(100) NOT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`preparation_recipe_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`preparation_recipe_id`) REFERENCES `preparation_recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Table: preparation_recipes
DROP TABLE IF EXISTS `preparation_recipes`;
CREATE TABLE `preparation_recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `version` varchar(20) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`ingredient_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Table: preparations
DROP TABLE IF EXISTS `preparations`;
CREATE TABLE `preparations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `material_id` int DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;


-- Table: products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '产品名称',
  `dough_id` int DEFAULT NULL COMMENT '关联面团（dough_types.id）',
  `other_ingredients` json DEFAULT NULL COMMENT '其他配料 JSON',
  `description` text DEFAULT NULL COMMENT '产品描述',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Table: recipe_ingredients_archive
DROP TABLE IF EXISTS `recipe_ingredients_archive`;
CREATE TABLE `recipe_ingredients_archive` (
  `id` int NOT NULL AUTO_INCREMENT,
  `version_id` int NOT NULL,
  `material_id` int DEFAULT NULL,
  `stage` enum('preferment','base','late') NOT NULL DEFAULT 'base',
  `percentage` decimal(5,2) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (1, 90001, NULL, 'base', '100.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (2, 90002, NULL, 'base', '100.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30001, 120002, NULL, 'base', '100.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30002, 120002, NULL, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30003, 120002, NULL, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30004, 120002, NULL, 'base', '1.80', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30005, 120002, NULL, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30006, 120002, NULL, 'base', '6.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30007, 120003, NULL, 'base', '100.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30008, 120003, NULL, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30009, 120003, NULL, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30010, 120003, NULL, 'base', '1.80', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30011, 120003, NULL, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30012, 120003, NULL, 'base', '6.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (30013, 120003, NULL, 'base', '15.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90001, 240001, 18, 'base', '100.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90002, 240001, 3, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90003, 240001, 9, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90004, 240001, 2, 'base', '1.80', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90005, 240001, 1, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90006, 240001, 5, 'base', '6.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90007, 240001, 19, 'base', '15.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90008, 240002, 18, 'base', '100.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90009, 240002, 3, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90010, 240002, 9, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90011, 240002, 2, 'base', '1.80', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90012, 240002, 1, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90013, 240002, 5, 'base', '6.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (90014, 240002, 19, 'base', '15.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120001, 330001, 18, 'preferment', '90.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120002, 330001, 17, 'preferment', '10.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120003, 330001, 12, 'preferment', '3.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120004, 330001, 8, 'preferment', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120005, 330001, 2, 'preferment', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120006, 330001, 4, 'preferment', '1.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120007, 330001, 19, 'base', '20.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (120008, 330001, 5, 'base', '8.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150001, 360001, 18, 'preferment', '90.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150002, 360001, 17, 'preferment', '10.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150003, 360001, 12, 'preferment', '3.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150004, 360001, 8, 'preferment', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150005, 360001, 2, 'preferment', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150006, 360001, 4, 'preferment', '1.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150007, 360001, 19, 'base', '20.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150008, 360001, 5, 'base', '6.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (150009, 360001, 1, 'preferment', '65.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180001, 390001, 18, 'base', '80.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180002, 390001, 13, 'base', '20.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180003, 390001, 8, 'base', '3.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180004, 390001, 2, 'base', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180005, 390001, 3, 'base', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180006, 390001, 9, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180007, 390001, 4, 'base', '0.20', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180008, 390001, 1, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (180009, 390001, 5, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210001, 420001, 18, 'base', '80.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210002, 420001, 13, 'base', '20.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210003, 420001, 8, 'base', '3.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210004, 420001, 2, 'base', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210005, 420001, 3, 'base', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210006, 420001, 9, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210007, 420001, 4, 'base', '0.20', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210008, 420001, 1, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (210009, 420001, 5, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240001, 450001, 18, 'base', '25.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240002, 450001, 13, 'base', '50.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240003, 450001, 8, 'base', '3.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240004, 450001, 2, 'base', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240005, 450001, 3, 'base', '2.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240006, 450001, 9, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240007, 450001, 4, 'base', '0.20', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240008, 450001, 1, 'base', '55.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240009, 450001, 5, 'base', '4.00', NULL, NULL);
INSERT INTO `recipe_ingredients_archive` (id, version_id, material_id, stage, percentage, note, unit) VALUES (240010, 450001, 150001, 'base', '25.00', NULL, NULL);


-- Table: recipe_ingredients_current
DROP TABLE IF EXISTS `recipe_ingredients_current`;
CREATE TABLE `recipe_ingredients_current` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `material_id` int DEFAULT NULL,
  `stage` enum('preferment','base','late') NOT NULL DEFAULT 'base',
  `percentage` decimal(5,2) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=390001;
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (30002, 7, 18, 'base', '100.00', NULL, NULL, '2026-03-26 03:24:37', '2026-03-26 08:05:25', 'v202603262');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150008, 7, 18, 'base', '100.00', NULL, NULL, '2026-03-26 13:34:43', '2026-03-26 13:34:43', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150009, 7, 3, 'base', '4.00', NULL, NULL, '2026-03-26 13:34:43', '2026-03-26 13:34:43', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150010, 7, 9, 'base', '4.00', NULL, NULL, '2026-03-26 13:34:43', '2026-03-26 13:34:43', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150011, 7, 2, 'base', '1.80', NULL, NULL, '2026-03-26 13:34:44', '2026-03-26 13:34:44', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150012, 7, 1, 'base', '55.00', NULL, NULL, '2026-03-26 13:34:44', '2026-03-26 13:34:44', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150013, 7, 5, 'base', '6.00', NULL, NULL, '2026-03-26 13:34:44', '2026-03-26 13:34:44', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150014, 7, 19, 'base', '15.00', NULL, NULL, '2026-03-26 13:34:44', '2026-03-26 13:34:44', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (150015, 7, 4, 'base', '1.00', NULL, NULL, '2026-03-26 13:34:45', '2026-03-26 13:34:45', 'v2026032607');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180001, 120001, 18, 'base', '45.00', NULL, NULL, '2026-03-26 13:48:47', '2026-03-26 13:48:47', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180002, 120001, 14, 'base', '20.00', NULL, NULL, '2026-03-26 13:48:48', '2026-03-26 13:48:48', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180003, 120001, 17, 'base', '35.00', NULL, NULL, '2026-03-26 13:48:48', '2026-03-26 13:48:48', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180004, 120001, 3, 'base', '8.00', NULL, NULL, '2026-03-26 13:48:48', '2026-03-26 13:48:48', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180005, 120001, 2, 'base', '1.80', NULL, NULL, '2026-03-26 13:48:49', '2026-03-26 13:48:49', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180006, 120001, 8, 'base', '4.00', NULL, NULL, '2026-03-26 13:48:49', '2026-03-26 13:48:49', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180007, 120001, 9, 'base', '4.00', NULL, NULL, '2026-03-26 13:48:49', '2026-03-26 13:48:49', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180008, 120001, 4, 'base', '0.80', NULL, NULL, '2026-03-26 13:48:49', '2026-03-26 13:48:49', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180009, 120001, 1, 'base', '58.00', NULL, NULL, '2026-03-26 13:48:50', '2026-03-26 13:48:50', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180010, 120001, 19, 'late', '15.00', NULL, NULL, '2026-03-26 13:48:50', '2026-03-26 13:48:50', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (180011, 120001, 5, 'late', '8.00', NULL, NULL, '2026-03-26 13:48:50', '2026-03-26 13:48:50', 'v2026032601');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210009, 150002, 18, 'base', '100.00', NULL, NULL, '2026-03-27 01:27:14', '2026-03-27 01:27:14', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210010, 150002, 8, 'base', '5.00', NULL, NULL, '2026-03-27 01:27:15', '2026-03-27 01:27:15', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210011, 150002, 9, 'base', '4.00', NULL, NULL, '2026-03-27 01:27:15', '2026-03-27 01:27:15', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210012, 150002, 3, 'base', '3.00', NULL, NULL, '2026-03-27 01:27:15', '2026-03-27 01:27:15', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210013, 150002, 4, 'base', '1.50', NULL, NULL, '2026-03-27 01:27:15', '2026-03-27 01:27:15', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210014, 150002, 1, 'base', '43.00', NULL, NULL, '2026-03-27 01:27:15', '2026-03-27 01:27:15', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210015, 150002, 6, 'base', '20.00', NULL, NULL, '2026-03-27 01:27:16', '2026-03-27 01:27:16', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210016, 150002, 3, 'late', '15.00', NULL, NULL, '2026-03-27 01:27:16', '2026-03-27 01:27:16', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210017, 150002, 2, 'late', '1.50', NULL, NULL, '2026-03-27 01:27:16', '2026-03-27 01:27:16', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210018, 150002, 19, 'late', '15.00', NULL, NULL, '2026-03-27 01:27:16', '2026-03-27 01:27:16', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (210019, 150002, 5, 'late', '10.00', NULL, NULL, '2026-03-27 01:27:17', '2026-03-27 01:27:17', 'v2026032701');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270001, 150001, 19, 'late', NULL, NULL, NULL, '2026-03-28 07:00:40', '2026-03-28 07:00:40', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270002, 150001, 18, 'base', '90.00', NULL, NULL, '2026-03-28 07:00:40', '2026-03-28 07:00:40', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270003, 150001, 17, 'base', '10.00', NULL, NULL, '2026-03-28 07:00:41', '2026-03-28 07:00:41', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270004, 150001, 12, 'base', '3.00', NULL, NULL, '2026-03-28 07:00:41', '2026-03-28 07:00:41', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270005, 150001, 8, 'base', '4.00', NULL, NULL, '2026-03-28 07:00:41', '2026-03-28 07:00:41', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270006, 150001, 2, 'base', '2.00', NULL, NULL, '2026-03-28 07:00:42', '2026-03-28 07:00:42', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270007, 150001, 4, 'base', '1.00', NULL, NULL, '2026-03-28 07:00:42', '2026-03-28 07:00:42', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (270008, 150001, 1, 'base', '65.00', NULL, NULL, '2026-03-28 07:00:42', '2026-03-28 07:00:42', 'v2026032801');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360001, 120002, 18, 'base', '25.00', NULL, NULL, '2026-03-30 09:53:36', '2026-03-30 09:53:36', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360002, 120002, 150001, 'base', '25.00', NULL, NULL, '2026-03-30 09:53:36', '2026-03-30 09:53:36', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360003, 120002, 13, 'base', '50.00', NULL, NULL, '2026-03-30 09:53:37', '2026-03-30 09:53:37', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360004, 120002, 8, 'base', '3.00', NULL, NULL, '2026-03-30 09:53:37', '2026-03-30 09:53:37', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360005, 120002, 2, 'base', '2.00', NULL, NULL, '2026-03-30 09:53:37', '2026-03-30 09:53:37', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360006, 120002, 3, 'base', '2.00', NULL, NULL, '2026-03-30 09:53:38', '2026-03-30 09:53:38', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360007, 120002, 9, 'base', '4.00', NULL, NULL, '2026-03-30 09:53:38', '2026-03-30 09:53:38', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360008, 120002, 4, 'base', '0.20', NULL, NULL, '2026-03-30 09:53:39', '2026-03-30 09:53:39', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360009, 120002, 1, 'base', '55.00', NULL, NULL, '2026-03-30 09:53:39', '2026-03-30 09:53:39', 'v2026033002');
INSERT INTO `recipe_ingredients_current` (id, recipe_id, material_id, stage, percentage, note, unit, created_at, updated_at, version) VALUES (360010, 120002, 5, 'base', '4.00', NULL, NULL, '2026-03-30 09:53:39', '2026-03-30 09:53:39', 'v2026033002');


-- Table: recipe_versions
DROP TABLE IF EXISTS `recipe_versions`;
CREATE TABLE `recipe_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `version_number` varchar(20) NOT NULL,
  `expected_temp` decimal(4,1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `timezone` varchar(20) DEFAULT 'Asia/Shanghai',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_recipe_version` (`recipe_id`,`version_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=480001;
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (6, 7, 'v2026032501', NULL, '2026-03-25 12:31:46', 'Asia/Shanghai');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (90001, 7, 'v2026032601', NULL, '2026-03-25 11:22:55', 'Asia/Shanghai');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (90002, 7, 'v2026032602', NULL, '2026-03-25 11:24:36', 'Asia/Shanghai');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (120001, 7, 'v2026032603', NULL, '2026-03-26 05:40:19', 'Asia/Shanghai');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (120002, 7, 'v2026032604', NULL, '2026-03-26 05:41:27', 'Asia/Shanghai');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (120003, 7, 'v2026032605', '26.0', '2026-03-26 06:22:00', 'Asia/Shanghai');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (240001, 7, 'v2026032606', '26.0', '2026-03-26 13:34:12', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (240002, 7, 'v2026032607', '26.0', '2026-03-26 13:34:40', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (270001, 120001, 'v2026032601', '26.0', '2026-03-26 13:48:47', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (270002, 120002, 'v2026032601', '23.0', '2026-03-26 13:53:02', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (300001, 150001, 'v2026032701', '26.0', '2026-03-27 01:21:44', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (300002, 150002, 'v2026032701', '27.0', '2026-03-27 01:27:14', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (330001, 150001, 'v2026032702', '26.0', '2026-03-27 10:39:56', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (360001, 150001, 'v2026032801', '26.0', '2026-03-28 07:00:35', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (390001, 120002, 'v2026032901', '25.0', '2026-03-29 10:54:06', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (420001, 120002, 'v2026033001', '25.0', '2026-03-30 07:04:44', 'UTC');
INSERT INTO `recipe_versions` (id, recipe_id, version_number, expected_temp, created_at, timezone) VALUES (450001, 120002, 'v2026033002', '25.0', '2026-03-30 09:53:30', 'UTC');


-- Table: recipes
DROP TABLE IF EXISTS `recipes`;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `source_id` int DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `material_id` int DEFAULT NULL,
  `current_version` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `timezone` varchar(20) DEFAULT 'Asia/Shanghai',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001;
INSERT INTO `recipes` (id, name, source_id, author, material_id, current_version, created_at, updated_at, timezone) VALUES (7, '日式贝果', NULL, '戴瑞冬', 22, 'v2026032607', '2026-03-25 12:31:46', '2026-03-26 13:34:42', 'Asia/Shanghai');
INSERT INTO `recipes` (id, name, source_id, author, material_id, current_version, created_at, updated_at, timezone) VALUES (120001, '盐可颂', NULL, '戴瑞冬', 90001, 'v2026032601', '2026-03-26 13:48:47', '2026-03-26 13:48:47', 'Asia/Shanghai');
INSERT INTO `recipes` (id, name, source_id, author, material_id, current_version, created_at, updated_at, timezone) VALUES (120002, '碱水面团', NULL, '戴瑞冬', 90002, 'v2026033002', '2026-03-26 13:53:01', '2026-03-30 09:53:35', 'Asia/Shanghai');
INSERT INTO `recipes` (id, name, source_id, author, material_id, current_version, created_at, updated_at, timezone) VALUES (150001, '脆皮越南法棍', NULL, '戴瑞冬', 120001, 'v2026032801', '2026-03-27 01:21:43', '2026-03-28 07:00:39', 'Asia/Shanghai');
INSERT INTO `recipes` (id, name, source_id, author, material_id, current_version, created_at, updated_at, timezone) VALUES (150002, '甜面团(直接法)', NULL, '戴瑞冬', 120002, 'v2026032701', '2026-03-27 01:27:14', '2026-03-27 01:27:14', 'Asia/Shanghai');


-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'staff',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `timezone` varchar(20) DEFAULT 'Asia/Shanghai',
  `can_view_recipes` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
INSERT INTO `users` (id, username, name, password, role, created_at, timezone, can_view_recipes) VALUES (1, 'admin', '戴瑞冬', '$2b$10$KCiyh3WMTkXu2yhiG087e.ucP/QIS1wP5T.HMSNGn5GOnmPyfRNkC', 'admin', '2026-03-24 07:00:11', 'Asia/Shanghai', 1);
INSERT INTO `users` (id, username, name, password, role, created_at, timezone, can_view_recipes) VALUES (30001, 'test', 'test', '$2b$10$2SOgg3gJG8uDITS4pkVsiOeb8YvaxBKKnDsN0Jc6zpru235veAG86', 'staff', '2026-03-26 03:16:01', 'Asia/Shanghai', 0);


-- Table: workday_slots
DROP TABLE IF EXISTS `workday_slots`;
CREATE TABLE `workday_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL COMMENT '工作日期',
  `user_id` int NOT NULL COMMENT '员工ID',
  `slot_index` int NOT NULL COMMENT '时间槽索引(0-287，5分钟为一个槽)',
  `task_type` varchar(50) DEFAULT NULL COMMENT '任务类型：打面/整形/准备馅料/其他',
  `product_id` int DEFAULT NULL COMMENT '关联产品',
  `description` varchar(255) DEFAULT NULL COMMENT '任务描述，可笼统',
  `duration_slots` int DEFAULT '1' COMMENT '持续多少个5分钟槽',
  `is_temporary` tinyint(1) DEFAULT '0' COMMENT '是否临时插入',
  `status` varchar(20) DEFAULT 'pending' COMMENT 'pending/running/completed',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `timezone` varchar(20) DEFAULT 'Asia/Shanghai',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_slot` (`date`,`user_id`,`slot_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Table: workflow_templates
DROP TABLE IF EXISTS `workflow_templates`;
CREATE TABLE `workflow_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '模板名称，如：早班流程',
  `user_id` int DEFAULT NULL COMMENT '所属员工，NULL=通用模板',
  `steps` json NOT NULL COMMENT '工作步骤 JSON',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
