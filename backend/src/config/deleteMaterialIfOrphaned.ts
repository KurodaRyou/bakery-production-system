import { pool } from './db';

export async function deleteMaterialIfOrphaned(
  connection: any,
  materialId: number | null,
) {
  if (!materialId) return;
  const [refs]: any = await connection.query(
    `SELECT 1 FROM ingredients WHERE material_id = ? UNION ALL
     SELECT 1 FROM doughs WHERE material_id = ? UNION ALL
     SELECT 1 FROM preparations WHERE material_id = ? UNION ALL
     SELECT 1 FROM dough_ingredients_current WHERE material_id = ? UNION ALL
     SELECT 1 FROM preparation_ingredients_current WHERE material_id = ?`,
    [materialId, materialId, materialId, materialId, materialId],
  );
  if (refs.length === 0) {
    await connection.query('DELETE FROM materials WHERE id = ?', [materialId]);
  }
}
