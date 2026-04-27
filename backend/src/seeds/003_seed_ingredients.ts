import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const existing = await knex('ingredients').first();
  if (existing) {
    console.log('Ingredients already seeded, skipping');
    return;
  }

  const commonIngredients = [
    { name: '面粉', type: 'flour', default_unit: '%', is_preparation: 0 },
    { name: '水', type: 'water', default_unit: '%', is_preparation: 0 },
    { name: '盐', type: 'salt', default_unit: '%', is_preparation: 0 },
    { name: '糖', type: 'sugar', default_unit: '%', is_preparation: 0 },
    { name: '干酵母', type: 'leavening', default_unit: '%', is_preparation: 0 },
    { name: '黄油', type: 'lipids', default_unit: '%', is_preparation: 0 },
    { name: '鸡蛋', type: 'protein', default_unit: '%', is_preparation: 0 },
    { name: '牛奶', type: 'dairy', default_unit: '%', is_preparation: 0 },
    { name: '奶粉', type: 'dairy', default_unit: '%', is_preparation: 0 },
    { name: '海藻糖', type: 'sugar', default_unit: '%', is_preparation: 0 },
    { name: '麦芽精', type: 'sugar', default_unit: '%', is_preparation: 0 },
    { name: '橄榄油', type: 'lipids', default_unit: '%', is_preparation: 0 },
    { name: '蜂蜜', type: 'sugar', default_unit: '%', is_preparation: 0 },
    { name: '玉米油', type: 'lipids', default_unit: '%', is_preparation: 0 },
    { name: '五得利910', type: 'flour', default_unit: 'g', is_preparation: 0 },
    { name: '金顶焙', type: 'flour', default_unit: 'g', is_preparation: 0 },
    { name: '王后T55', type: 'flour', default_unit: 'g', is_preparation: 0 },
    { name: '王后T65', type: 'flour', default_unit: 'g', is_preparation: 0 },
  ];

  await knex('ingredients').insert(commonIngredients);
  console.log(`Seed ingredients created: ${commonIngredients.length} items`);
}