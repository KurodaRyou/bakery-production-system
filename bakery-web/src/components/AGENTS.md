# Frontend Components - AI Agent Context

**Parent:** ../../AGENTS.md  
**Location:** bakery-web/src/components/

---

## 📚 相关文档

| 文件 | 内容 |
|------|------|
| `../../AGENTS.md` | 项目总览、数据库 Schema、API 路由 |
| `../../backend/AGENTS.md` | 后端架构、认证流程 |
| `../../MEMO.md` | 技术备忘录、数据库设计 |
| `../../CONVENTIONS.md` | 代码规范 |

---

## Component List

| File | Purpose |
|------|---------|
| App.jsx | Main router, auth state, layout |
| LoginView.jsx | Login form |
| MixingView.jsx | Entry point for mixing features (home, records, calculator) |
| RecordListView.jsx | Timeline of mixing records |
| RecordDetailView.jsx | Single record view |
| NewRecordView.jsx | Create mixing record |
| MixingCalculator.jsx | Calculate ingredients by target weight |
| RecipeListView.jsx | Recipe list with caching |
| NewRecipeView.jsx | Create recipe with @dnd-kit drag-drop |
| EditRecipeView.jsx | Edit recipe |
| RecipeDetailView.jsx | Recipe version history |
| IngredientListView.jsx | Materials/ingredients list |
| NewIngredientView.jsx | Create material/ingredient |
| EditIngredientView.jsx | Edit material/ingredient |
| UserManagementView.jsx | Admin: manage users |
| SettingsView.jsx | User settings |
| ChangePasswordView.jsx | Change password |
| MonitorDashboard.jsx | Temperature/humidity monitoring (planned) |
| WorkClock.jsx | Work schedule (planned) |

---

## Auth Pattern (Cookie-Based)

```javascript
// api.js - Cookie-based auth
import { saveAuth, getAuth, logout, fetchMe } from './services/api'

// All API calls use credentials: 'include'
fetch('/api/...', { credentials: 'include' })

// On 401, reload page
if (res.status === 401) {
    window.location.reload()
}
```

### User State in App.jsx
```javascript
const [user, setUser] = useState(null)

// On mount, check sessionStorage for user
const auth = getAuth()  // Returns { user: { username, name, role, canViewRecipes } }
if (auth.user) {
    setUser(auth.user)
    fetchMe().then(data => setUser(...))
}
```

### Role Checks
```javascript
const canCreateOrEdit = user?.role === 'admin' || user?.role === 'manager'
const isAdmin = user?.role === 'admin'
```

---

## Page Header Pattern (MANDATORY for ALL sub-pages)

**规则：每个子页面都必须有返回按钮，没有例外。**

```jsx
<div className="page-header">
    <div className="page-header-left">
        <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="back-btn-text">返回</span>
        </button>
    </div>
    <span className="page-title">页面标题</span>
    <div style={{ width: 60 }}/>  {/* Spacer or action button */}
</div>
```

### Back Button Rules
1. **每个子页面都必须有 onBack prop**
2. **返回按钮在 page-header-left 中**
3. **使用 className="back-btn"**
4. **点击时调用 onBack()**

### Button Classes
- `back-btn` - 返回按钮 (左侧)
- `back-btn.save` - 操作按钮 (右侧, 绿色)

---

## Form Patterns

### Form Section
```jsx
<div className="form-section">
    <div className="form-row">
        <label>标签</label>
        <input .../>
    </div>
</div>
```

### Delete Confirmation Modal
```jsx
{showDeleteAlert && (
    <>
        <div className="modal-overlay" onClick={() => setShowDeleteAlert(false)}/>
        <div className="modal">
            <p>确定要删除 "{item.name}" 吗？</p>
            <button className="btn btn-danger">确认删除</button>
        </div>
    </>
)}
```

---

## API Service (services/api.js)

### Key Exports
```javascript
saveAuth(user)           // Save to sessionStorage
getAuth()                // Returns { user } or { user: null }
logout()                 // POST /auth/logout, clears sessionStorage
fetchMe()                // GET /auth/me

fetchRecords()           // GET /records
createRecord(data)       // POST /records
updateRecord(batch, data) // PUT /records/:batchNumber
deleteRecord(batch)       // DELETE /records/:batchNumber

fetchRecipes()            // GET /recipes
fetchRecipeById(id)      // GET /recipes/:id
createRecipe(data)       // POST /recipes
updateRecipe(id, data)   // PUT /recipes/:id
deleteRecipe(id)         // DELETE /recipes/:id

fetchPreparations()       // GET /preparations
fetchMaterials()         // GET /materials
fetchUsers()             // GET /users (admin)
```

### Error Handling
```javascript
// All functions throw Error with message on failure
// 401 triggers auto-reload
```

---

## Caching (services/cache.js)

```javascript
// 5-minute localStorage cache
const { data, timestamp } = cache.get('key')
if (data && Date.now() - timestamp < 5 * 60 * 1000) {
    return data
}
// ... fetch fresh data ...
cache.set('key', freshData)
```

---

## Drag and Drop (@dnd-kit)

Used in NewRecipeView and EditRecipeView for ingredient reordering.

```javascript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// Each sortable item needs useSortable hook
// onDragEnd handles reorder logic
```

---

## Conventions

### File Naming
- PascalCase: `MixingView.jsx`, `RecordListView.jsx`
- camelCase for services: `api.js`, `cache.js`

### Styling
- CSS variables: `var(--color-primary)`, `var(--color-text)`, etc.
- Inline `<style>` tag for component-specific styles

### Units (from CONVENTIONS.md)
- Weight: `kg` (lowercase)
- Temperature: `°C` (after number)
- Currency: `¥` before amount

### State for Re-renders
```javascript
// When creating new records, increment key to force remount
const [refreshKey, setRefreshKey] = useState(0)
<RecordListView key={refreshKey} .../>

// When editing, force form remount
const [editKey, setEditKey] = useState(0)
<EditRecipeView key={editKey} .../>
```

---

## Component Props Patterns

```javascript
// View components typically receive:
function MixingView({ user }) {  // App passes user from state
function RecordListView({ showHeader, onNewRecord, onShowNewButton, user }) {
function NewRecordView({ onBack, onSuccess }) {  // Call callbacks on actions
```

### Callback Patterns
- `onBack` - Return to previous view
- `onSuccess` - After successful create/update, refresh list
- `onNewRecord` - Open new record form

---

## Important Notes

### MixingCalculator (2026-04-07)
- Select recipe/preparation from dropdown
- Fetch full details via `/api/recipes/:id` or `/api/preparations/:id` on selection
- Enter target weight in kg
- Calculates actual ingredient amounts with loss_rate

### Recipe Privacy
- `can_view_recipes` permission controls whether ingredient names are hidden
- Backend returns `material_name: '******'` if not permitted

---

## TODO Components (Not Yet Functional)

- `MonitorDashboard.jsx` - Temperature monitoring UI (needs backend)
- `WorkClock.jsx` - Work schedule display (needs backend API)
