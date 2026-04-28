import { useState, useEffect } from 'react'
import { fetchRecipeById, deleteRecipe, fetchRecipeVersions, restoreRecipeVersion } from '../services/api'
import EditRecipeView from './EditRecipeView'

function formatTimeWithTimezone(utcTime) {
  return new Date(utcTime).toLocaleString('zh-CN');
}

function RecipeDetailView({ recipeId, onBack, showHeader = true }) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versions, setVersions] = useState([])
  const [alert, setAlert] = useState('')

  useEffect(() => {
    loadRecipe()
  }, [recipeId])

  async function loadRecipe() {
    setLoading(true)
    try {
      const data = await fetchRecipeById(recipeId)
      setRecipe(data)
    } catch (error) {
      console.error('Failed to load recipe:', error)
    }
    setLoading(false)
  }

  async function handleDelete() {
    try {
      await deleteRecipe(recipeId)
      onBack()
    } catch (error) {
      setAlert(`删除失败: ${error.message}`)
    }
  }

  async function handleRestore(versionNumber) {
    try {
      await restoreRecipeVersion(recipeId, versionNumber)
      setAlert('已恢复到该版本')
      setShowVersionHistory(false)
      loadRecipe()
    } catch (error) {
      setAlert(`恢复失败: ${error.message}`)
    }
  }

  async function loadVersions() {
    try {
      const data = await fetchRecipeVersions(recipeId)
      setVersions(data)
    } catch (error) {
      console.error('Failed to load versions:', error)
    }
  }

  function handleShowHistory() {
    loadVersions()
    setShowVersionHistory(true)
  }

  if (loading) {
    return (
      <div className="detail-view">
        {showHeader && (
          <div className="page-header">
            <div className="page-header-left">
              <button className="back-btn" onClick={onBack}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <span className="back-btn-text">返回</span>
              </button>
            </div>
            <span className="page-title">配方详情</span>
            <div style={{ width: 60 }}></div>
          </div>
        )}
        <div className="loading"><div className="spinner"></div></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="detail-view">
        {showHeader && (
          <div className="page-header">
            <div className="page-header-left">
              <button className="back-btn" onClick={onBack}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <span className="back-btn-text">返回</span>
              </button>
            </div>
            <span className="page-title">配方详情</span>
            <div style={{ width: 60 }}></div>
          </div>
        )}
        <div className="empty-state">
          <p>加载失败</p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <EditRecipeView
        recipe={recipe}
        onBack={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false)
          loadRecipe()
        }}
      />
    )
  }

  const stageLabels = { preferment: '预发酵', base: '主面团', late: '后加' }
  const stages = ['preferment', 'base', 'late']

  const groupedIngredients = {}
  stages.forEach(stage => {
    groupedIngredients[stage] = recipe.ingredients?.filter(ing => ing.stage === stage) || []
  })

  return (
    <div className="detail-view">
      {showHeader && (
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">返回</span>
            </button>
          </div>
          <span className="page-title">配方详情</span>
          <button className="back-btn save" onClick={() => setIsEditing(true)}>编辑</button>
        </div>
      )}
      
      <div className="recipe-detail">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2>{recipe.name}</h2>
          <button 
            className="back-btn" 
            onClick={handleShowHistory}
            style={{ fontSize: '14px', color: 'var(--color-ios-gray)' }}
          >
            历史版本 ›
          </button>
        </div>
        {recipe.author && (
          <div className="recipe-category">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
              <line x1="6" y1="17" x2="18" y2="17"/>
            </svg>
            {recipe.author}
          </div>
        )}
        {recipe.expected_temp && (
          <div className="recipe-category">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>
            期望出缸温度: {recipe.expected_temp}°C
          </div>
        )}

        {stages.map(stage => {
          const ings = groupedIngredients[stage]
          if (ings.length === 0) return null
          return (
            <div key={stage} className="recipe-section">
              <h3>{stageLabels[stage]}</h3>
              <div className="ingredient-list">
                {ings.map((ing, index) => (
                  <div key={index} className="ingredient-item">
                    <span className="ingredient-name">{ing.material_name}</span>
                    {ing.percentage && (
                      <span className="ingredient-percentage">{ing.percentage}%</span>
                    )}
                    {ing.note && (
                      <span className="ingredient-note">{ing.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn btn-danger btn-full" onClick={() => setShowDeleteAlert(true)}>
        删除配方
      </button>

      {showDeleteAlert && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeleteAlert(false)} />
          <div className="modal">
            <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
              <button className="modal-close" onClick={() => setShowDeleteAlert(false)}>取消</button>
            </div>
            <div style={{ padding: '24px 16px' }}>
              <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>确定要删除这个配方吗？此操作无法撤销。</p>
              <div style={{ display: 'flex' }}>
                <button className="btn btn-danger" onClick={handleDelete} style={{ flex: 1 }}>确认删除</button>
              </div>
            </div>
          </div>
        </>
      )}

      {showVersionHistory && (
        <>
          <div className="modal-overlay" onClick={() => setShowVersionHistory(false)} />
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">历史版本</span>
              <button className="modal-close" onClick={() => setShowVersionHistory(false)}>关闭</button>
            </div>
            <div className="list" style={{ margin: 0, borderRadius: 0 }}>
              {versions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <p>暂无历史版本</p>
                </div>
              ) : (
                versions.map(v => (
                  <div 
                    key={v.id} 
                    className="list-item"
                    onClick={() => handleRestore(v.version_number)}
                  >
                    <div className="list-item-content">
                      <div className="list-item-title">版本 {v.version_number}</div>
                      <div className="list-item-subtitle">
                        {formatTimeWithTimezone(v.created_at)}
                      </div>
                    </div>
                    <span className="chevron">恢复</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {alert && <div className="alert">{alert}</div>}
    </div>
  )
}

export default RecipeDetailView