import { useState, useEffect } from 'react'
import { fetchIngredients } from '../services/api'

function IngredientListView({ onBack, onNew, onEdit }) {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIngredients()
  }, [])

  async function loadIngredients() {
    setLoading(true)
    try {
      const data = await fetchIngredients()
      setIngredients(data)
    } catch (error) {
      console.error('Failed to load ingredients:', error)
    }
    setLoading(false)
  }

  const normalizeSpec = (spec) => {
    if (!spec) return null
    return spec.replace(/KG|Kg|kG/gi, 'kg')
  }

  const typeLabels = {
    flour: '面粉',
    lipids: '油脂',
    sugar: '糖',
    salt: '盐',
    leavening: '膨松剂/酵母',
    dairy: '奶制品',
    protein: '蛋白质',
    water: '水',
    additive: '添加剂',
    others: '其他'
  }

  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const type = ing.type || 'others'
    if (!acc[type]) acc[type] = []
    acc[type].push(ing)
    return acc
  }, {})

  const typeOrder = ['flour', 'lipids', 'sugar', 'salt', 'leavening', 'dairy', 'protein', 'water', 'additive', 'others']
  const sortedTypes = Object.keys(groupedIngredients).sort((a, b) => {
    return typeOrder.indexOf(a) - typeOrder.indexOf(b)
  })

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
        <span className="page-title">原材料</span>
        <button className="back-btn save" onClick={onNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : ingredients.length === 0 ? (
        <div className="empty-state">
          <p>暂无原材料</p>
          <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>点击右上角按钮添加</p>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {sortedTypes.map(type => (
            <div key={type} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', paddingLeft: 16, marginBottom: 8 }}>
                {typeLabels[type] || type}
              </div>
              <div className="list">
                {groupedIngredients[type].map((ing) => (
                  <div key={ing.id} className="list-item" onClick={() => onEdit(ing)}>
                    <span className="list-item-content">
                      <span className="list-item-title">{ing.name}</span>
                      <span className="list-item-subtitle">
                        {ing.manufacturer && `${ing.manufacturer}`}
                        {normalizeSpec(ing.spec) && ` · ${normalizeSpec(ing.spec)}`}
                        {ing.price != null && ` · ¥${Number(ing.price).toFixed(1)}`}
                      </span>
                    </span>
                    <span className="chevron">›</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

</div>
  )
}

export default IngredientListView