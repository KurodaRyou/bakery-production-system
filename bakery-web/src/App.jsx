import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { fetchCsrfToken } from './services/api'
import LoginView from './components/LoginView'
import RecipeListView from './components/RecipeListView'
import MixingView from './components/MixingView'
import MonitorDashboard from './components/MonitorDashboard'
import WorkClock from './components/WorkClock'
import NewIngredientView from './components/NewIngredientView'
import IngredientListView from './components/IngredientListView'
import EditIngredientView from './components/EditIngredientView'
import ChangePasswordView from './components/ChangePasswordView'
import UserManagementView from './components/UserManagementView'

function RecipeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

const MORE_MENU_ITEMS = [
  { 
    icon: <RecipeIcon />, 
    label: '配方', 
    show: (u) => u.canViewRecipes, 
    action: 'recipeList' 
  },
  { 
    icon: <UsersIcon />, 
    label: '人员管理', 
    show: (u) => u.role === 'admin', 
    action: 'userManagement' 
  },
  { 
    icon: <WheatIcon />, 
    label: '原材料', 
    show: (u) => u.role === 'admin', 
    action: 'ingredientList' 
  },
  { 
    icon: <KeyIcon />, 
    label: '修改密码', 
    show: () => true, 
    action: 'changePassword' 
  },
  { 
    icon: <LogoutIcon />, 
    label: '退出登录', 
    show: () => true, 
    action: 'logout' 
  },
]

function MoreMenu({ onAction }) {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="list" style={{ marginTop: 20 }}>
      {MORE_MENU_ITEMS.filter(item => item.show(user)).map((item, i) => (
        <div key={i} className="list-item" onClick={() => onAction(item.action)}>
          <span className="menu-icon">{item.icon}</span>
          <span className="list-item-content">
            <span className="list-item-title">{item.label}</span>
          </span>
          <span className="chevron">›</span>
        </div>
      ))}
    </div>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function WheatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22L16 8" />
      <path d="M3.47 12.53L5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M7.47 8.53L9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M11.47 4.53L13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M20 2h2v2a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V2h2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2z" />
      <path d="M15.54 14.54L14 13l-1.06 1.06a3.5 3.5 0 0 0 0 4.94l1.06 1.06a3.5 3.5 0 0 0 4.94 0l1.06-1.06" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function App() {
  const user = useAuthStore((s) => s.user)
  const initialize = useAuthStore((s) => s.initialize)
  const logout = useAuthStore((s) => s.logout)
  const [tab, setTab] = useState('mixing')
  const [overlay, setOverlay] = useState(null)
  const [editingIngredient, setEditingIngredient] = useState(null)
  const [ingredientListKey, setIngredientListKey] = useState(0)

  useEffect(() => {
    fetchCsrfToken()
    initialize()
  }, [initialize])

  const handleAction = (action) => {
    if (action === 'logout') {
      logout()
    } else {
      setOverlay(action)
    }
  }

  if (!user) return <LoginView />

  const overlays = {
    recipeList: <RecipeListView onBack={() => setOverlay(null)} />,
    newIngredient: <NewIngredientView onBack={() => setOverlay(null)} onSuccess={() => { setOverlay(null); setIngredientListKey(k => k + 1) }} />,
    ingredientList: <IngredientListView key={ingredientListKey} onBack={() => setOverlay(null)} onNew={() => setOverlay('newIngredient')} onEdit={(ing) => { setEditingIngredient(ing); setOverlay('editIngredient') }} />,
    editIngredient: editingIngredient ? <EditIngredientView key={editingIngredient.id} ingredient={editingIngredient} onBack={() => { setEditingIngredient(null); setOverlay('ingredientList') }} onSuccess={() => { setEditingIngredient(null); setOverlay('ingredientList'); setIngredientListKey(k => k + 1) }} /> : null,
    changePassword: <ChangePasswordView onBack={() => setOverlay(null)} />,
    userManagement: <UserManagementView onBack={() => setOverlay(null)} />,
  }

  if (overlay) return (
    <div className="app">
      <div className="page">
        {overlays[overlay]}
      </div>
    </div>
  )

  return (
    <div className="app">
      <div className="page">
        {tab === 'mixing' && <MixingView />}
        {tab === 'monitor' && <MonitorDashboard />}
        {tab === 'workclock' && <WorkClock />}
        {tab === 'more' && (
          <div>
            <div className="page-header">
              <span className="page-title">更多</span>
            </div>
            <MoreMenu onAction={handleAction} />
          </div>
        )}
      </div>
      <div className="tab-bar">
        <TabItem active={tab === 'mixing'} onClick={() => setTab('mixing')} icon="mixing">打面</TabItem>
        <TabItem active={tab === 'workclock'} onClick={() => setTab('workclock')} icon="workclock">工作</TabItem>
        <TabItem active={tab === 'monitor'} onClick={() => setTab('monitor')} icon="monitor">监控</TabItem>
        <TabItem active={tab === 'more'} onClick={() => setTab('more')} icon="more">更多</TabItem>
      </div>
    </div>
  )
}

function TabItem({ active, onClick, icon, children }) {
  const icons = {
    recipe: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />,
    mixing: <path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 2.76-2.24 5-5 5s-5-2.24-5-5c0-1.5.5-2.5 1.5-3.5C8.5 5.5 10 5 12 2z" />,
    workclock: <><circle cx="12" cy="12" r="9" strokeWidth="2" /><path d="M12 6v6l4 2" /></>,
    monitor: <><path d="M12 22V12M12 12C12 7 7 4 2 6M12 12C12 7 17 4 22 6" /><circle cx="12" cy="12" r="2" /></>,
    more: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
  }

  return (
    <div className={`tab-item ${active ? 'active' : ''}`} onClick={onClick}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {icons[icon]}
      </svg>
      <span>{children}</span>
    </div>
  )
}

export default App