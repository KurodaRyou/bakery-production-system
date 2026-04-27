-- 添加损耗率字段到配方原料表
-- 损耗率默认 1.00 表示 1%

-- dough_recipe_ingredients_current
ALTER TABLE dough_recipe_ingredients_current ADD COLUMN loss_rate DECIMAL(5,2) DEFAULT 1.00;
UPDATE dough_recipe_ingredients_current SET loss_rate = 1.00 WHERE loss_rate IS NULL;

-- dough_recipe_ingredients_archive
ALTER TABLE dough_recipe_ingredients_archive ADD COLUMN loss_rate DECIMAL(5,2) DEFAULT 1.00;
UPDATE dough_recipe_ingredients_archive SET loss_rate = 1.00 WHERE loss_rate IS NULL;

-- preparation_ingredients_current
ALTER TABLE preparation_ingredients_current ADD COLUMN loss_rate DECIMAL(5,2) DEFAULT 1.00;
UPDATE preparation_ingredients_current SET loss_rate = 1.00 WHERE loss_rate IS NULL;

-- preparation_ingredients_archive
ALTER TABLE preparation_ingredients_archive ADD COLUMN loss_rate DECIMAL(5,2) DEFAULT 1.00;
UPDATE preparation_ingredients_archive SET loss_rate = 1.00 WHERE loss_rate IS NULL;
