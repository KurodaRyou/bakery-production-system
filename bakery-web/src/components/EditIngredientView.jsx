import { useState } from 'react'
import { updateIngredient, deleteIngredient } from '../services/api'

function EditIngredientView({ ingredient, onBack, onSuccess }) {
  const [name, setName] = useState(ingredient.name || '')
  const [type, setType] = useState(ingredient.type || 'others')
  const [manufacturer, setManufacturer] = useState(ingredient.manufacturer || '')
  const [spec, setSpec] = useState(ingredient.spec || '')
  const [price, setPrice] = useState(ingredient.price != null ? String(ingredient.price) : '')
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState('')
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const types = [
    { value: 'flour', label: '面粉' },
    { value: 'lipids', label: '油脂' },
    { value: 'sugar', label: '糖' },
    { value: 'salt', label: '盐' },
    { value: 'leavening', label: '膨松剂/酵母' },
    { value: 'dairy', label: '奶制品' },
    { value: 'protein', label: '蛋白质' },
    { value: 'water', label: '水' },
    { value: 'additive', label: '添加剂' },
    { value: 'others', label: '其他' }
  ]

  async function handleSave() {
    if (!name.trim()) {
      setAlert('请输入原料名称')
      return
    }

    setSaving(true)
    try {
      await updateIngredient(ingredient.id, { 
        name: name.trim(), 
        type, 
        manufacturer: manufacturer.trim() || null, 
        spec: spec.trim() || null, 
        price: price ? parseFloat(price) : null 
      })
      setAlert('保存成功')
      onSuccess()
    } catch (error) {
      setAlert(`保存失败: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteIngredient(ingredient.id)
      onSuccess()
    } catch (error) {
      setAlert(`删除失败: ${error.message}`)
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
        <span className="page-title">编辑原料</span>
        <button 
          className="back-btn save" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中' : '保存'}
        </button>
      </div>

      <div className="form-section" style={{ marginTop: '16px' }}>
        <div style={{ padding: '12px 16px', marginBottom: 12 }}>
          <button 
            onClick={() => setShowDeleteAlert(true)}
            style={{ 
              background: 'rgba(220, 38, 38, 0.1)', 
              color: 'var(--color-danger)', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              width: '100%'
            }}
          >
            删除原料
          </button>
        </div>
        <div className="form-row">
          <label>原料名称</label>
          <input 
            type="text" 
            placeholder="如：高筋面粉、黄油" 
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>类型</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>制造商</label>
          <input 
            type="text" 
            placeholder="如：王后、金牌" 
            value={manufacturer}
            onChange={e => setManufacturer(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>规格</label>
          <input 
            type="text" 
            placeholder="如：1kg、25kg" 
            value={spec}
            onChange={e => setSpec(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>价格</label>
          <input 
            type="number" 
            placeholder="如：45" 
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
      </div>

      {alert && <div className="alert">{alert}</div>}

      {showDeleteAlert && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeleteAlert(false)} />
          <div className="modal">
            <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
              <button className="modal-close" onClick={() => setShowDeleteAlert(false)}>取消</button>
            </div>
            <div style={{ padding: '24px 16px' }}>
              <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>确定要删除 "{ingredient.name}" 吗？此操作无法撤销。</p>
              <div style={{ display: 'flex' }}>
                <button className="btn btn-danger" onClick={handleDelete} style={{ flex: 1 }}>确认删除</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EditIngredientView