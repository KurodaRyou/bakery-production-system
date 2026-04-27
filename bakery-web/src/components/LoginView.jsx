import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

function LoginView() {
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(username, password)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-view">
      <div className="login-background">
        <div className="login-shape login-shape-1"></div>
        <div className="login-shape login-shape-2"></div>
        <div className="login-shape login-shape-3"></div>
      </div>
      
      <div className="login-content">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" fill="var(--color-primary)" opacity="0.1"/>
              <ellipse cx="40" cy="42" rx="28" ry="20" fill="var(--color-secondary)"/>
              <ellipse cx="40" cy="38" rx="24" ry="16" fill="var(--color-primary-light)"/>
              <path d="M20 38C20 38 25 32 40 32C55 32 60 38 60 38" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
              <ellipse cx="40" cy="36" rx="20" ry="12" fill="var(--color-secondary)" opacity="0.6"/>
              <circle cx="32" cy="34" r="3" fill="var(--color-primary)" opacity="0.3"/>
              <circle cx="48" cy="36" r="2" fill="var(--color-primary)" opacity="0.3"/>
              <circle cx="40" cy="32" r="2" fill="var(--color-primary)" opacity="0.3"/>
            </svg>
          </div>
          <h1 className="login-title">Bakery App</h1>
          <p className="login-subtitle">烘焙配方与生产管理</p>
        </div>
        
        <div className="login-form">
          <div className="login-card">
            <div className="login-input-group">
              <label className="login-label">用户名</label>
              <input 
                type="text" 
                placeholder="请输入用户名" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                className="login-input"
              />
            </div>
            <div className="login-divider"></div>
            <div className="login-input-group">
              <label className="login-label">密码</label>
              <input 
                type="password" 
                placeholder="请输入密码" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                className="login-input"
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button 
            className="btn btn-primary btn-full login-btn" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="login-loading">登录中...</span>
            ) : (
              '登录'
            )}
          </button>
        </div>
      </div>

      <style>{`
        .login-view {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface-hover) 50%, var(--color-border) 100%);
          position: relative;
          overflow: hidden;
        }
        
        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        
        .login-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
        }
        
        .login-shape-1 {
          width: 300px;
          height: 300px;
          background: var(--color-secondary);
          top: -100px;
          right: -100px;
        }
        
        .login-shape-2 {
          width: 200px;
          height: 200px;
          background: var(--color-primary);
          bottom: -50px;
          left: -50px;
        }
        
        .login-shape-3 {
          width: 150px;
          height: 150px;
          background: var(--color-secondary);
          top: 50%;
          left: 10%;
          opacity: 0.05;
        }
        
        .login-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 360px;
          animation: fadeInUp 0.6s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .login-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .login-logo svg {
          width: 100%;
          height: 100%;
        }
        
        .login-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        
        .login-subtitle {
          font-size: 14px;
          color: var(--color-text-muted);
          letter-spacing: 0.1em;
        }
        
        .login-form {
          width: 100%;
        }
        
        .login-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .login-input-group {
          padding: 16px 20px;
        }
        
        .login-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        
        .login-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 16px;
          font-family: var(--font-body);
          color: var(--color-text);
          background: transparent;
          padding: 8px 0;
        }
        
        .login-input::placeholder {
          color: var(--color-text-muted);
          opacity: 0.6;
        }
        
        .login-divider {
          height: 1px;
          background: var(--color-border);
          margin: 0 20px;
        }
        
        .login-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--color-danger);
          font-size: 14px;
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(220, 38, 38, 0.08);
          border-radius: var(--radius-md);
        }
        
        .login-error svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        
        .login-btn {
          height: 52px;
          font-size: 17px;
        }
        
        .login-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>
    </div>
  )
}

export default LoginView