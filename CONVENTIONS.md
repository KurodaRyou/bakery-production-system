# Bakery App 前端规范

**Last Updated:** 2026-04-27

---

## UI/UX 规范

### 单位显示
- **重量单位**：kg（小写，国际标准）
- **货币**：¥ 符号在前，金额在后
- **温度**：°C 符号在后

示例：
- 规格：1kg、25kg
- 价格：¥45.0
- 温度：26°C

### 删除确认弹窗
使用底部滑出 modal 样式：
- 暗色遮罩背景 (rgba(31, 20, 16, 0.5))
- 滑上动画 (0.3s bounce)
- 右上角取消按钮
- 居中确认文案
- 红色确认删除按钮

```jsx
const [showDeleteAlert, setShowDeleteAlert] = useState(false)

<>
  <button onClick={() => setShowDeleteAlert(true)}>删除</button>
  {showDeleteAlert && (
    <>
      <div className="modal-overlay" onClick={() => setShowDeleteAlert(false)} />
      <div className="modal">
        <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
          <button className="modal-close" onClick={() => setShowDeleteAlert(false)}>取消</button>
        </div>
        <div style={{ padding: '24px 16px' }}>
          <p>确定要删除 "{item.name}" 吗？此操作无法撤销。</p>
          <button className="btn btn-danger" onClick={handleDelete}>确认删除</button>
        </div>
      </div>
    </>
  )}
</>
```

### 状态颜色
- 绿色：正常/达标 (success)
- 红色：超标/过高 (danger)
- 蓝色：偏低 (info)
- 灰色：未知/无数据 (muted)

### 表单输入
- 非必填字段尽量用空字符串而非 null
- 数字类型用 `parseFloat()` 或 `parseInt()` 转换
- 文本用 `.trim()` 去除首尾空格

---

## CSS 变量

```css
:root {
  --color-bg: #FBF7F4;
  --color-primary: #8B5A2B;
  --color-primary-light: #A67C52;
  --color-primary-dark: #6B4423;
  --color-secondary: #D4A574;
  --color-accent: #2D5016;
  --color-text: #1F1410;
  --color-text-muted: #8B7355;
  --color-border: #E8DDD4;
  --color-surface: #FFFFFF;
  --color-surface-hover: #FDF9F6;
  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-warning: #EA580C;
  --color-info: #2563EB;
  --shadow-hover: 0 6px 16px rgba(139, 90, 43, 0.12);
  --shadow-active: 0 2px 6px rgba(139, 90, 43, 0.1);
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 避免 Hardcoded 颜色
- ❌ `#8E8E93`, `#ff3b30`, `#DC2626` → ✅ `var(--color-text-muted)`, `var(--color-danger)`
- ❌ `#f5f5f5` → ✅ `var(--color-bg)`

---

## 通用样式类

- `.menu-grid`, `.menu-item`, `.menu-icon`
- `.recipe-grid`, `.recipe-card`
- `.timeline-container`, `.timeline-item`, `.timeline-dot`
- `.user-list`, `.user-item`, `.user-role-badge`
- `.ingredient-dropdown`, `.ingredient-dropdown-item`
- `.result-summary`, `.calculator-table`, `.calculator-table-header`, `.calculator-table-row`

---

## 代码规范

### 禁止事项
- ❌ `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ Empty catch blocks `catch(e) {}`
- ❌ `error.message` in API responses
- ❌ Token in localStorage
- ❌ String concatenation in SQL
- ❌ Validate version numbers with `isNaN(parseInt())`
- ❌ 内嵌 `<style>` 块（使用全局 CSS 变量）
- ❌ 密码/密钥写入代码或文档

### 命名规范
- React 组件：PascalCase (`RecipeListView`)
- 函数/变量：camelCase (`getRecipeDetail`)
- CSS 类：kebab-case (`recipe-card`)
- 环境变量：UPPER_SNAKE_CASE (`DB_HOST`)

---

## 项目结构

```
bakery/
├── backend/           # Node.js + Express API
│   ├── server.js      # 单文件 API (~1600 lines)
│   ├── setup-*.js     # 数据库迁移脚本
│   └── .env           # 环境变量（不提交）
├── bakery-web/        # React + Vite 前端
│   └── src/
│       └── components/
├── mcp-server/        # MCP Server (LLM 集成)
│   ├── src/
│   └── examples/      # 客户端配置示例
├── sql/               # SQL 迁移文件
├── docker-compose.yml
└── AGENTS.md          # AI Agent 知识库
```