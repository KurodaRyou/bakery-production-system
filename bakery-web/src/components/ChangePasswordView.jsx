import { useState } from 'react'
import { updateProfile } from '../services/api'

function ChangePasswordView({ onBack }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alert, setAlert] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!newPassword) {
      setAlert('请输入新密码')
      return
    }

    if (newPassword !== confirmPassword) {
      setAlert('两次输入的密码不一致')
      return
    }

    if (newPassword.length < 6) {
      setAlert('密码长度至少6位')
      return
    }

    setSaving(true)
    try {
      await updateProfile(null, newPassword)
      setAlert('修改成功')
    } catch (e) {
      setAlert(e.message)
    } finally {
      setSaving(false)
    }
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
        <span className="page-title">修改密码</span>
        <button 
          className="back-btn save" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中' : '保存'}
        </button>
      </div>

      <div className="form-section" style={{ marginTop: '16px' }}>
        <div className="form-row">
          <label>新密码</label>
          <input 
            type="password" 
            placeholder="请输入新密码"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>确认密码</label>
          <input 
            type="password" 
            placeholder="再次输入新密码"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      {alert && <div className="alert">{alert}</div>}
    </div>
  )
}

export default ChangePasswordView