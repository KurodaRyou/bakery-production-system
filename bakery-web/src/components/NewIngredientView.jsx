import { useState } from 'react'
import { createIngredient } from '../services/api'

function NewIngredientView({ onBack, onSuccess }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('flour')
  const [manufacturer, setManufacturer] = useState('')
  const [spec, setSpec] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState('')

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
      await createIngredient({ name: name.trim(), type, manufacturer: manufacturer.trim() || null, spec: spec.trim() || null, price: price ? parseFloat(price) : null })
      setAlert('保存成功')
      if (onSuccess) onSuccess()
    } catch (error) {
      setAlert(`保存失败: ${error.message}`)
    }
    setSaving(false)
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
        <span className="page-title">新增原料</span>
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
    </div>
  )
}

export default NewIngredientView