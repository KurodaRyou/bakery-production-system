import { useState, useEffect } from 'react'
import { fetchIngredients, deleteMaterial, batchDeleteMaterials } from '../services/api'

function IngredientListView({ onBack, onNew, onEdit }) {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockModalData, setBlockModalData] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmItems, setConfirmItems] = useState([])

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

  function toggleSelect(ingredientId) {
    setSelectedIds(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    )
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds([])
  }

  function getSelectedMaterials() {
    const idSet = new Set(selectedIds)
    return ingredients.filter(ing => idSet.has(ing.id)).map(ing => ing.material_id)
  }

  async function handleDeleteSelected() {
    const materialIds = getSelectedMaterials()
    if (materialIds.length === 0) return

    setDeleting(true)
    try {
      if (materialIds.length === 1) {
        await deleteMaterial(materialIds[0])
      } else {
        await batchDeleteMaterials(materialIds)
      }
      exitSelectMode()
      await loadIngredients()
    } catch (error) {
      if (error.data && (error.data.error === 'material_in_use' || error.data.error === 'materials_in_use')) {
        setBlockModalData(error.data)
        setShowBlockModal(true)
      } else {
        alert(error.message || '删除失败')
      }
    }
    setDeleting(false)
  }

  function handleRequestDelete() {
    const materialIds = getSelectedMaterials()
    if (materialIds.length === 0) return

    const selectedNames = ingredients
      .filter(ing => selectedIds.includes(ing.id))
      .map(ing => ing.name)

    setConfirmItems(selectedNames)
    setShowConfirmModal(true)
  }

  async function handleConfirmDelete() {
    setShowConfirmModal(false)
    await handleDeleteSelected()
  }

  function handleItemClick(ing) {
    if (selectMode) {
      toggleSelect(ing.id)
    } else {
      onEdit(ing)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={selectMode ? exitSelectMode : onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="back-btn-text">{selectMode ? '取消' : '返回'}</span>
          </button>
        </div>
        <span className="page-title">原材料</span>
        {!selectMode ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="back-btn save" onClick={() => setSelectMode(true)}>
              选择
            </button>
            <button className="back-btn save" onClick={onNew}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {selectMode && selectedIds.length > 0 && (
        <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-danger"
            onClick={handleRequestDelete}
            disabled={deleting}
            style={{ flex: 'unset', padding: '10px 24px', fontSize: 14 }}
          >
            {deleting ? '删除中…' : `删除 (${selectedIds.length})`}
          </button>
        </div>
      )}

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
                {groupedIngredients[type].map((ing) => {
                  const isSelected = selectedIds.includes(ing.id)
                  return (
                    <div
                      key={ing.id}
                      className="list-item"
                      onClick={() => handleItemClick(ing)}
                      style={isSelected ? { background: 'var(--color-surface-hover)' } : {}}
                    >
                      {selectMode && (
                        <span style={{ marginRight: 10, display: 'flex', alignItems: 'center' }}>
                          {isSelected ? (
                            <svg viewBox="0 0 24 24" fill="var(--color-primary)" stroke="none" style={{ width: 22, height: 22 }}>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" style={{ width: 22, height: 22 }}>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                          )}
                        </span>
                      )}
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
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showBlockModal && blockModalData && (
        <>
          <div className="modal-overlay" onClick={() => setShowBlockModal(false)} />
          <div className="modal">
            <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
              <button className="modal-close" onClick={() => setShowBlockModal(false)}>关闭</button>
            </div>
            <div style={{ padding: '24px 16px' }}>
              <p style={{ marginBottom: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 600 }}>
                无法删除原材料
              </p>
              <p style={{ marginBottom: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                以下配方正在使用这些原材料，请先从配方中移除后再试：
              </p>
              {(blockModalData.failedDeletions || blockModalData.references ? (
                blockModalData.failedDeletions
                  ? blockModalData.failedDeletions
                  : [{ materialId: null, materialName: '', recipes: blockModalData.references }]
              ) : []).map((item, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  {item.materialName ? (
                    <p style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 8 }}>
                      {item.materialName}
                    </p>
                  ) : null}
                  {item.recipes.map((r, i) => (
                    <p key={i} style={{ fontSize: 14, paddingLeft: 12, marginBottom: 4, color: 'var(--color-text-muted)' }}>
                      {r.type === 'dough' ? '配方' : '半成品'}：{r.name}
                      {r.version ? ` (${r.version})` : ''}
                    </p>
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setShowBlockModal(false)} style={{ flex: 1 }}>
                  知道了
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showConfirmModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)} />
          <div className="modal">
            <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>取消</button>
            </div>
            <div style={{ padding: '24px 16px' }}>
              <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>
                确定要删除「{confirmItems.join('」和「')}」吗？此操作无法撤销。
              </p>
              <div style={{ display: 'flex' }}>
                <button className="btn btn-danger" onClick={handleConfirmDelete} style={{ flex: 1 }}>
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default IngredientListView
