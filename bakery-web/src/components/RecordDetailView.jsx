import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { deleteRecord, updateRecord } from '../services/api'

function RecordDetailView({ record, onBack, showHeader = true }) {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'admin' || user?.role === 'manager'
  const canDelete = user?.role === 'admin'
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [alert, setAlert] = useState('')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    dough_name: record.dough_name || '',
    operator: record.operator || '',
    dry_temp: record.dry_temp || '',
    room_temp: record.room_temp || '',
    water_temp: record.water_temp || '',
    output_temp: record.output_temp || '',
    ice_ratio: record.ice_ratio || '',
    flour_amount: record.flour_amount || '',
    water_amount: record.water_amount || '',
    machine_speed: record.machine_speed || '',
    machine: record.machine || '',
    gluten_level: record.gluten_level || '',
    bulk_ferment_temp: record.bulk_ferment_temp || '',
    bulk_ferment_time: record.bulk_ferment_time || ''
  })

  const [machines] = useState([
    { id: 1, name: 'M40T' },
    { id: 2, name: '乔立10L' },
    { id: 3, name: '佳麦7L' }
  ])
  const [doughTypes] = useState([
    { id: 1, name: '蒙特利尔贝果' },
    { id: 2, name: '甜面团' },
    { id: 3, name: '日式贝果' },
    { id: 4, name: '越南法棍' },
    { id: 5, name: '盐可颂' },
    { id: 6, name: '碱水' },
    { id: 7, name: '可颂' },
    { id: 8, name: '米面包' },
    { id: 9, name: '其他' }
  ])

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!formData.dough_name) {
      setAlert('请选择面团种类')
      return
    }
    if (!formData.dry_temp) {
      setAlert('请填写干料温度')
      return
    }
    if (!formData.room_temp) {
      setAlert('请填写室温')
      return
    }
    if (!formData.water_temp) {
      setAlert('请填写水温')
      return
    }
    if (!formData.flour_amount || parseFloat(formData.flour_amount) <= 0) {
      setAlert('请填写面粉用量（需大于0）')
      return
    }
    if (!formData.water_amount || parseFloat(formData.water_amount) <= 0) {
      setAlert('请填写水量（需大于0）')
      return
    }
    if (!formData.output_temp || parseFloat(formData.output_temp) <= 0) {
      setAlert('请填写出缸温度（需大于0）')
      return
    }
    if (!formData.machine) {
      setAlert('请选择打面设备')
      return
    }
    if (formData.gluten_level && (parseFloat(formData.gluten_level) <= 0 || parseFloat(formData.gluten_level) > 15)) {
      setAlert('出缸面筋需大于0且不超过15')
      return
    }

    setSaving(true)
    const updatedRecord = {
      dough_name: formData.dough_name,
      operator: formData.operator || null,
      dry_temp: parseFloat(formData.dry_temp) || null,
      room_temp: parseFloat(formData.room_temp) || null,
      water_temp: parseFloat(formData.water_temp) || null,
      output_temp: parseFloat(formData.output_temp) || null,
      ice_ratio: parseFloat(formData.ice_ratio) || null,
      flour_amount: parseFloat(formData.flour_amount) || null,
      water_amount: parseFloat(formData.water_amount) || null,
      machine_speed: formData.machine_speed || null,
      machine: formData.machine,
      gluten_level: parseFloat(formData.gluten_level) || null,
      bulk_ferment_temp: parseFloat(formData.bulk_ferment_temp) || null,
      bulk_ferment_time: parseInt(formData.bulk_ferment_time) || null
    }

    try {
      await updateRecord(record.batch_number, updatedRecord)
      setAlert('保存成功')
      setIsEditing(false)
    } catch (error) {
      setAlert(`保存失败: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteRecord(record.batch_number)
      onBack()
    } catch (error) {
      setAlert(`删除失败: ${error.message}`)
    }
  }

  if (isEditing) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => setIsEditing(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="back-btn-text">取消</span>
            </button>
          </div>
          <span className="page-title">编辑记录</span>
          <button 
            className="back-btn save" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中' : '保存'}
          </button>
        </div>

        <div className="section-header">基本信息</div>
        <div className="form-section">
          <div className="form-row-static">
            <label>批次号</label>
            <span className="value">{record.batch_number}</span>
          </div>
          <div className="form-row">
            <label>面团种类</label>
            <div className="picker-wrapper">
              <select 
                value={formData.dough_name} 
                onChange={e => handleChange('dough_name', e.target.value)}
              >
                <option value="">请选择</option>
                {doughTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>操作人</label>
            <input 
              type="text" 
              value={formData.operator}
              onChange={e => handleChange('operator', e.target.value)}
            />
          </div>
        </div>

        <div className="section-header">温度记录</div>
        <div className="form-section">
          <div className="form-row">
            <label>干料温度</label>
            <input 
              type="number" 
              value={formData.dry_temp}
              onChange={e => handleChange('dry_temp', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>室温</label>
            <input 
              type="number" 
              value={formData.room_temp}
              onChange={e => handleChange('room_temp', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>水温</label>
            <input 
              type="number" 
              value={formData.water_temp}
              onChange={e => handleChange('water_temp', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>出缸温度</label>
            <input 
              type="number" 
              value={formData.output_temp}
              onChange={e => handleChange('output_temp', e.target.value)}
            />
          </div>
        </div>

        <div className="section-header">材料配比</div>
        <div className="form-section">
          <div className="form-row">
            <label>冰占比</label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <input 
                type="number" 
                value={formData.ice_ratio}
                onChange={e => handleChange('ice_ratio', e.target.value)}
                style={{ width: '60px', textAlign: 'right' }}
              />
              <span style={{ color: 'var(--color-ios-gray)', fontSize: '17px' }}>%</span>
            </div>
          </div>
          <div className="form-row">
            <label>面粉用量</label>
            <input 
              type="number" 
              value={formData.flour_amount}
              onChange={e => handleChange('flour_amount', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>水量</label>
            <input 
              type="number" 
              value={formData.water_amount}
              onChange={e => handleChange('water_amount', e.target.value)}
            />
          </div>
        </div>

        <div className="section-header">打面设备</div>
        <div className="form-section">
          <div className="form-row">
            <label>打面流程</label>
            <input 
              type="text" 
              value={formData.machine_speed}
              onChange={e => handleChange('machine_speed', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>打面设备</label>
            <div className="picker-wrapper">
              <select 
                value={formData.machine} 
                onChange={e => handleChange('machine', e.target.value)}
              >
                <option value="">请选择</option>
                {machines.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>出缸面筋</label>
            <input 
              type="number" 
              value={formData.gluten_level}
              onChange={e => handleChange('gluten_level', e.target.value)}
            />
          </div>
        </div>

        <div className="section-header">发酵设置</div>
        <div className="form-section">
          <div className="form-row">
            <label>基础发酵温度</label>
            <input 
              type="number" 
              value={formData.bulk_ferment_temp}
              onChange={e => handleChange('bulk_ferment_temp', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>基础发酵时间</label>
            <input 
              type="number" 
              value={formData.bulk_ferment_time}
              onChange={e => handleChange('bulk_ferment_time', e.target.value)}
            />
          </div>
        </div>

        {alert && <div className="alert">{alert}</div>}
      </div>
    )
  }

  function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === '') return null
    return (
      <div className="detail-row">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
      </div>
    )
  }

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
          <span className="page-title">记录详情</span>
          {canEdit && <button className="back-btn save" onClick={() => setIsEditing(true)}>编辑</button>}
        </div>
      )}

      <div className="section-header">基本信息</div>
      <div className="detail-section">
        <div className="detail-row">
          <span className="detail-label">批次号</span>
          <span className="detail-value">{record.batch_number}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">面团种类</span>
          <span className="detail-value">{record.dough_name}</span>
        </div>
        {record.operator && (
          <div className="detail-row">
            <span className="detail-label">操作人</span>
            <span className="detail-value">{record.operator}</span>
          </div>
        )}
      </div>

      <div className="section-header">温度记录</div>
      <div className="detail-section">
        <DetailRow label="干料温度" value={record.dry_temp ? `${record.dry_temp}°C` : null} />
        <DetailRow label="室温" value={record.room_temp ? `${record.room_temp}°C` : null} />
        <DetailRow label="水温" value={record.water_temp ? `${record.water_temp}°C` : null} />
        <DetailRow label="出缸温度" value={record.output_temp ? `${record.output_temp}°C` : null} />
      </div>

      <div className="section-header">材料配比</div>
      <div className="detail-section">
        <DetailRow label="冰占比" value={record.ice_ratio} />
        <DetailRow label="面粉用量" value={record.flour_amount ? `${record.flour_amount} kg` : null} />
        <DetailRow label="水量" value={record.water_amount ? `${record.water_amount} L` : null} />
      </div>

      <div className="section-header">机器设置</div>
      <div className="detail-section">
        <DetailRow label="机器转速/流程" value={record.machine_speed} />
        <DetailRow label="机器" value={record.machine} />
        <DetailRow label="出缸面筋" value={record.gluten_level} />
      </div>

      <div className="section-header">发酵设置</div>
      <div className="detail-section">
        <DetailRow label="基础发酵温度" value={record.bulk_ferment_temp ? `${record.bulk_ferment_temp}°C` : null} />
        <DetailRow label="基础发酵时间" value={record.bulk_ferment_time ? `${record.bulk_ferment_time} 分钟` : null} />
      </div>

      {canDelete && (
        <button className="btn btn-danger btn-full" onClick={() => setShowDeleteAlert(true)}>
          删除记录
        </button>
      )}

      {showDeleteAlert && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeleteAlert(false)} />
          <div className="modal">
            <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
              <button className="modal-close" onClick={() => setShowDeleteAlert(false)}>取消</button>
            </div>
            <div style={{ padding: '24px 16px' }}>
              <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>确定要删除这条记录吗？此操作无法撤销。</p>
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

export default RecordDetailView