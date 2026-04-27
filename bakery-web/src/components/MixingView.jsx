import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import RecordListView from './RecordListView'
import NewRecordView from './NewRecordView'
import MixingCalculator from './MixingCalculator'

function MixingView() {
  const user = useAuthStore((s) => s.user)
  const [view, setView] = useState('home') // 'home' | 'records' | 'new' | 'calculator'
  const [showNewButton, setShowNewButton] = useState(true)
  const [newRecordKey, setNewRecordKey] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const canCreateOrEdit = user?.role === 'admin' || user?.role === 'manager'

  const handleBack = () => {
    setView('home')
    setRefreshKey(k => k + 1)
  }

  if (view === 'records') {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => setView('home')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">返回</span>
            </button>
          </div>
          <span className="page-title">打面记录</span>
          <div style={{ width: 60 }} />
        </div>
        <RecordListView
          key={refreshKey}
          showHeader={false}
          onNewRecord={() => {
            setNewRecordKey(k => k + 1)
            setView('new')
          }}
          onShowNewButton={setShowNewButton}
        />
        {showNewButton && canCreateOrEdit && (
          <div style={{ padding: '0 16px 16px' }}>
            <button className="btn btn-primary btn-full" onClick={() => {
              setNewRecordKey(k => k + 1)
              setView('new')
            }}>
              新建记录
            </button>
          </div>
        )}
      </div>
    )
  }

  if (view === 'new') {
    return (
      <NewRecordView 
        key={newRecordKey} 
        onBack={handleBack} 
        onSuccess={handleBack} 
      />
    )
  }

  if (view === 'calculator') {
    return (
      <MixingCalculator onBack={handleBack} />
    )
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-title">打面</span>
        <button 
          className="back-btn save"
          onClick={() => setView('records')}
        >
          打面记录
        </button>
      </div>

      <div className="section-header">打面功能</div>
      <div className="form-section">
        <div className="menu-grid">
          <div className="menu-item" onClick={() => setView('calculator')}>
            <div className="menu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <line x1="8" y1="6" x2="16" y2="6"/>
                <line x1="8" y1="10" x2="16" y2="10"/>
                <line x1="8" y1="14" x2="12" y2="14"/>
                <line x1="8" y1="18" x2="12" y2="18"/>
              </svg>
            </div>
            <span className="menu-label">配方计算器</span>
            <span className="menu-desc">按配方计算原料用量</span>
          </div>
          
          {canCreateOrEdit && (
            <div className="menu-item" onClick={() => {
              setNewRecordKey(k => k + 1)
              setView('new')
            }}>
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <span className="menu-label">新建记录</span>
              <span className="menu-desc">记录打面信息</span>
            </div>
          )}
        </div>
      </div>

</div>
  )
}

export default MixingView
