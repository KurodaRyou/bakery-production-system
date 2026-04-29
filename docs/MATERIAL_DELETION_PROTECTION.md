# 原材料删除保护方案

## 背景

当前系统缺少原材料的删除保护机制，导致：
- 配方中使用的原材料可被直接删除，产生"孤配料"现象
- 删除原材料后，配方数据产生不一致
- 用户可能误删正在使用的材料

## 方案选择

### 硬拦截（最终方案）

删除原材料前，强制检查是否被配方引用。有引用则阻止删除，用户必须先从配方中移除该材料。

**优点**：数据一致性高，操作路径清晰
**缺点**：批量删除时用户体验略复杂

---

## 详细设计

### 删除前检查

批量或单独删除原材料时，执行引用检查：

```sql
-- 检查 dough_ingredients_current
SELECT DISTINCT d.id, d.name, di.version
FROM doughs d
JOIN dough_ingredients_current di ON di.dough_id = d.id
WHERE di.material_id IN (?)

UNION ALL

-- 检查 preparation_ingredients_current
SELECT DISTINCT p.id, p.name, pi.version
FROM preparations p
JOIN preparation_ingredients_current pi ON pi.preparation_id = p.id
WHERE pi.material_id IN (?)
```

返回结果按 `material_id` 分组。

### 单个删除流程

```
用户点击删除按钮
    ↓
后端检查该 material_id 是否被任何配方使用
    ↓
有引用 → 返回 409 + 引用列表，阻止删除
无引用 → 弹确认框（与配方删除一致）
         ↓
         用户确认 → 执行 DELETE FROM materials
```

### 批量删除流程

```
用户选择 N 个材料，点击批量删除
    ↓
后端一次性检查所有 N 个材料的引用情况
    ↓
存在任意一个有引用
  → 返回 409 + 分组引用信息，全部不删
  示例：
  {
    "errors": [
      { "materialId": 1, "materialName": "高筋面粉", "recipes": [
          { "type": "dough", "id": 6, "name": "盐可颂" },
          { "type": "preparation", "id": 3, "name": "原味奶酥" }
        ]},
      { "materialId": 2, "materialName": "黄油", "recipes": [
          { "type": "preparation", "id": 3, "name": "原味奶酥" }
        ]}
    ]
  }
    ↓
全部无引用
  → 弹确认框（与配方删除一致）
  → 用户确认 → 执行批量 DELETE FROM materials WHERE id IN (?)
```

### 前端弹窗设计

**引用存在时的弹窗**（阻止删除）：

```
┌─────────────────────────────────────────┐
│  无法删除原材料                           │
│                                          │
│  以下配方正在使用这些原材料：               │
│                                          │
│  高筋面粉                                 │
│  ├─ 配方：盐可颂                          │
│  └─ 半成品：原味奶酥                       │
│                                          │
│  黄油                                     │
│  └─ 半成品：原味奶酥                       │
│                                          │
│  请先从这些配方中移除对应材料后再试。        │
│                                          │
│                        [知道了]           │
└─────────────────────────────────────────┘
```

**确认删除弹窗**（无引用，可删除）：

```
┌─────────────────────────────────────────┐
│  确认删除原材料                           │
│                                          │
│  将删除以下 2 个原材料：                   │
│  • 高筋面粉（type: ingredient）           │
│  • 糖（type: ingredient）                │
│                                          │
│  此操作不可撤销。                          │
│                                          │
│              [取消]  [确认删除]            │
└─────────────────────────────────────────┘
```

---

## API 设计

### 单个删除

```
DELETE /api/materials/:id

响应（成功）：
204 No Content

响应（有引用）：
409 Conflict
{
  "error": "material_in_use",
  "message": "该原材料正在被配方使用，无法删除",
  "references": [
    { "type": "dough", "id": 6, "name": "盐可颂" },
    { "type": "preparation", "id": 3, "name": "原味奶酥" }
  ]
}
```

### 批量删除

```
POST /api/materials/batch-delete
Content-Type: application/json

Body:
{ "ids": [1, 2, 3] }

响应（全部可删）：
200 OK
{
  "deleted": 3,
  "deletedMaterials": [
    { "id": 1, "name": "高筋面粉" },
    { "id": 2, "name": "糖" },
    { "id": 3, "name": "盐" }
  ]
}

响应（部分或全部有引用）：
409 Conflict
{
  "error": "materials_in_use",
  "message": "部分原材料正在被配方使用，无法删除",
  "failedDeletions": [
    {
      "materialId": 1,
      "materialName": "高筋面粉",
      "recipes": [
        { "type": "dough", "id": 6, "name": "盐可颂" },
        { "type": "preparation", "id": 3, "name": "原味奶酥" }
      ]
    }
  ]
}
```

---

## 实现范围

### 后端改动

| 文件 | 改动 |
|------|------|
| `backend/src/routes/materials.js` | 新增 `checkMaterialUsage()` 函数，修改 DELETE 和批量删除接口 |

### 前端改动

| 文件 | 改动 |
|------|------|
| `bakery-web/src/components/IngredientListView.jsx` | 批量选择 UI + 删除按钮 + 引用弹窗 + 确认弹窗 |
| `bakery-web/src/components/common/DeleteConfirmModal.jsx` | 复用或新增确认弹窗组件 |

### 数据库改动

**无改动**。FK 约束保留，拦截发生在 API 层。

---

## FK 约束说明

当前 `dough_ingredients_current.material_id` 和 `preparation_ingredients_current.material_id` 都有 FK 指向 `materials.id`。

保留 FK 的原因：拦截发生在删除操作之前（API 层），代码检查到有引用则直接返回 409，不会走到 DB 层执行 DELETE，因此 FK 约束不会触发 DB error。

同时 FK 约束提供了额外的保护，防止因代码 bug 导致级联删除。

---

## 后续可扩展

- 提供"强制删除"选项（admin 可选，绕过检查）
- 删除原材料时自动从配方中移除（需用户确认）
