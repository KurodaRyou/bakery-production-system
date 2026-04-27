import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/api'

export const ROLES = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '主管' },
  { value: 'staff', label: '员工' }
]

export const PERMISSIONS = [
  { value: 'can_view_recipes', label: '可查看配方' }
]

function UserManagementView({ onBack }) {
  const updateUserStore = useAuthStore((s) => s.updateUser)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [creatingUser, setCreatingUser] = useState(null)
  const [alert, setAlert] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (error) {
      setAlert(`加载失败: ${error.message}`)
    }
    setLoading(false)
  }

  async function handleSave() {
    try {
      await updateUser(editingUser.id, {
        role: editingUser.role,
        can_view_recipes: editingUser.can_view_recipes,
        name: editingUser.name
      })
      const auth = useAuthStore.getState()
      if (auth.user && auth.user.username === editingUser.username) {
        const updatedUser = { ...auth.user, name: editingUser.name }
        updateUserStore(updatedUser)
      }
      setEditingUser(null)
      loadUsers()
      setAlert('保存成功')
    } catch (error) {
      setAlert(`保存失败: ${error.message}`)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除该账号吗？')) return
    try {
      await deleteUser(id)
      loadUsers()
      setAlert('删除成功')
    } catch (error) {
      setAlert(`删除失败: ${error.message}`)
    }
  }

  function handleCreate() {
    setCreatingUser({ username: '', password: '', role: 'staff', can_view_recipes: false, name: '' })
  }

  async function handleCreateSubmit() {
    if (!creatingUser.username || !creatingUser.password) {
      setAlert('请填写用户名和密码')
      return
    }
    try {
      await createUser(creatingUser)
      setCreatingUser(null)
      loadUsers()
      setAlert('创建成功')
    } catch (error) {
      setAlert(`创建失败: ${error.message}`)
    }
  }

  function togglePermission(user, perm) {
    const updated = { ...user }
    updated[perm] = !updated[perm]
    setEditingUser(updated)
  }

  if (editingUser) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => setEditingUser(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">返回</span>
            </button>
          </div>
          <span className="page-title">编辑 {editingUser.username}</span>
          <button className="back-btn save" onClick={handleSave}>保存</button>
        </div>

        <div className="form-section" style={{ marginTop: '16px' }}>
          <div className="form-row">
            <label>姓名</label>
            <input
              type="text"
              placeholder="请输入姓名"
              value={editingUser.name || ''}
              onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>角色</label>
            <select
              value={editingUser.role}
              onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>权限</label>
            {PERMISSIONS.map(p => (
              <label key={p.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={editingUser[p.value]}
                  onChange={() => togglePermission(editingUser, p.value)}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {alert && <div className="alert">{alert}</div>}
      </div>
    )
  }

  if (creatingUser) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => setCreatingUser(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">返回</span>
            </button>
          </div>
          <span className="page-title">新增员工</span>
          <button className="back-btn save" onClick={handleCreateSubmit}>创建</button>
        </div>

        <div className="form-section" style={{ marginTop: '16px' }}>
          <div className="form-row">
            <label>用户名</label>
            <input
              type="text"
              placeholder="请输入用户名"
              value={creatingUser.username}
              onChange={e => setCreatingUser({ ...creatingUser, username: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>姓名</label>
            <input
              type="text"
              placeholder="请输入姓名"
              value={creatingUser.name || ''}
              onChange={e => setCreatingUser({ ...creatingUser, name: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>密码</label>
            <input
              type="password"
              placeholder="请输入密码"
              value={creatingUser.password}
              onChange={e => setCreatingUser({ ...creatingUser, password: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>角色</label>
            <select
              value={creatingUser.role}
              onChange={e => setCreatingUser({ ...creatingUser, role: e.target.value })}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>权限</label>
            {PERMISSIONS.map(p => (
              <label key={p.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={creatingUser[p.value]}
                  onChange={() => setCreatingUser({ ...creatingUser, [p.value]: !creatingUser[p.value] })}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {alert && <div className="alert">{alert}</div>}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="back-btn-text">返回</span>
          </button>
        </div>
        <span className="page-title">人员管理</span>
        <button className="back-btn save" onClick={handleCreate}>新增员工</button>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ios-tertiary)' }}>加载中...</div>
      ) : (
        <div className="user-list">
          {users.map(user => (
            <div key={user.id} className="user-item">
              <div className="user-info">
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-role-badge">{ROLES.find(r => r.value === user.role)?.label || user.role}</span>
              </div>
              <div className="user-actions">
                <button className="user-edit-btn" onClick={() => setEditingUser(user)}>编辑</button>
                {user.username !== 'admin' && (
                  <button className="user-delete-btn" onClick={() => handleDelete(user.id)}>删除</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {alert && <div className="alert">{alert}</div>}

</div>
  )
}

export default UserManagementView