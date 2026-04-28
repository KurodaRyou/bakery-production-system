import { useState, useEffect } from 'react'
import { fetchRecipes, fetchRecipeById } from '../services/api'

function MixingCalculator({ onBack }) {
  const [mode, setMode] = useState('input')
  const [recipes, setRecipes] = useState([])
  const [preparations, setPreparations] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [targetWeight, setTargetWeight] = useState('')
  const [loading, setLoading] = useState(true)

  const [resultData, setResultData] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [recipesData, prepData] = await Promise.all([
        fetchRecipes(),
        fetch('/api/preparations', { credentials: 'include' }).then(r => r.json())
      ])
      setRecipes(recipesData)
      setPreparations(prepData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const allItems = [
    ...recipes.map(r => ({ ...r, itemType: 'dough', displayType: '面团' })),
    ...preparations.map(p => ({ ...p, itemType: 'preparation', displayType: '半成品' }))
  ]

  async function handleSelect(materialId) {
    const item = allItems.find(i => i.material_id === Number(materialId))
    if (!item) return

    setSelectedItem(item)
    setSelectedIngredients([])

    try {
      if (item.itemType === 'dough') {
        const res = await fetch(`/api/dough/by-material/${materialId}`, { credentials: 'include' })
        const fullRecipe = await res.json()
        setSelectedIngredients(fullRecipe.ingredients || [])
      } else {
        const res = await fetch(`/api/preparations/by-material/${materialId}`, { credentials: 'include' })
        const prepData = await res.json()
        setSelectedIngredients(prepData.ingredients || [])
      }
    } catch (error) {
      console.error('Failed to load item:', error)
      setSelectedIngredients([])
    }
  }

  function calculateAndStart() {
    if (!selectedItem || !targetWeight || parseFloat(targetWeight) <= 0) return
    if (selectedIngredients.length === 0) return

    const weight = parseFloat(targetWeight)
    const ingredients = selectedIngredients
    const totalPct = ingredients.reduce((sum, ing) => sum + (parseFloat(ing.percentage) || 0), 0)

    if (totalPct === 0) return

    let lossRate = parseFloat(selectedItem.loss_rate) || 1
    const totalRaw = weight * (1 + lossRate / 100)

    const calculated = ingredients.map(ing => {
      const percentage = parseFloat(ing.percentage) || 0
      const rawWeight = totalRaw * (percentage / totalPct)
      return {
        material_name: ing.material_name || ing.name || '未知材料',
        rawWeight: rawWeight.toFixed(3),
        percentage: percentage
      }
    })

    setResultData({
      name: selectedItem.name,
      lossRate: lossRate,
      targetWeight: weight,
      totalRaw: totalRaw,
      totalPct: totalPct,
      ingredients: calculated
    })

    setCurrentIndex(0)
    setMode('weighing')
  }

  function confirmCurrent() {
    if (currentIndex < resultData.ingredients.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setMode('complete')
    }
  }

  if (mode === 'weighing' && resultData) {
    const current = resultData.ingredients[currentIndex]
    const progress = ((currentIndex) / resultData.ingredients.length) * 100
    const weightInGrams = (parseFloat(current.rawWeight) * 1000).toFixed(0)

    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => setMode('input')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">返回</span>
            </button>
          </div>
          <span className="page-title">称重中</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              <span>{currentIndex + 1} / {resultData.ingredients.length}</span>
              <span>{resultData.name}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div className="weighing-card">
            <div style={{ fontSize: '20px', fontWeight: '500', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '12px' }}>
              {current.material_name}
            </div>
            <div style={{ fontSize: '64px', fontWeight: '700', color: 'var(--color-primary)', textAlign: 'center' }}>
              {weightInGrams}
            </div>
            <div style={{ fontSize: '18px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '8px' }}>
              g
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={confirmCurrent}
            style={{ marginTop: '24px' }}
          >
            已称重，确认
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'complete' && resultData) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => setMode('input')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">返回</span>
            </button>
          </div>
          <span className="page-title">完成</span>
          <div style={{ width: 60 }} />
        </div>

        <div className="form-section" style={{ marginTop: 20 }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" style={{ width: 48, height: 48 }}>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 12 15 16 9"/>
            </svg>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', marginTop: '12px' }}>
              称重完成
            </div>
          </div>

          <div className="calculator-table">
            <div className="calculator-table-header">
              <span>材料</span>
              <span>用量</span>
            </div>
            {resultData.ingredients.map((ing, index) => (
              <div key={index} className="calculator-table-row">
                <span>{ing.material_name}</span>
                <span className="weight-value">{(parseFloat(ing.rawWeight) * 1000).toFixed(0)}g</span>
              </div>
            ))}
          </div>
        </div>
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
        <span className="page-title">配方计算器</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="form-section" style={{ marginTop: 20 }}>
        <div className="form-row">
          <label>配方/半成品</label>
          <select
            value={selectedItem ? String(selectedItem.material_id) : ''}
            onChange={e => handleSelect(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontFamily: 'var(--font-body)',
              background: 'transparent',
              color: 'var(--color-text)',
              textAlign: 'right'
            }}
          >
            <option value="">选择配方</option>
            <optgroup label="面团">
              {recipes.map(r => (
                <option key={r.material_id} value={r.material_id}>{r.name}</option>
              ))}
            </optgroup>
            <optgroup label="半成品">
              {preparations.map(p => (
                <option key={p.material_id} value={p.material_id}>{p.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="form-row">
          <label>目标成品重量</label>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <input
              type="number"
              placeholder="请输入"
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              style={{
                width: '100px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'var(--font-body)',
                background: 'transparent',
                color: 'var(--color-text)',
                textAlign: 'right'
              }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>kg</span>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={calculateAndStart}
        disabled={!selectedItem || !targetWeight || parseFloat(targetWeight) <= 0}
        style={{ marginTop: 20 }}
      >
        开始称重
      </button>
    </div>
  )
}

export default MixingCalculator
