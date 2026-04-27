import { useState, useEffect } from 'react'
import { createRecord, fetchMachines, fetchDoughTypes, fetchRecords, getPreviewBatchNumber, reserveBatchNumber } from '../services/api'

function NewRecordView({ onBack, onSuccess }) {
  const [batchNumber, setBatchNumber] = useState('')
  const [doughName, setDoughName] = useState('')
  const [dryTemp, setDryTemp] = useState('')
  const [roomTemp, setRoomTemp] = useState('')
  const [iceRatio, setIceRatio] = useState('')
  const [waterTemp, setWaterTemp] = useState('')
  const [flourAmount, setFlourAmount] = useState('')
  const [waterAmount, setWaterAmount] = useState('')
  const [machineSpeed, setMachineSpeed] = useState('')
  const [glutenLevel, setGlutenLevel] = useState('')
  const [outputTemp, setOutputTemp] = useState('')
  const [machine, setMachine] = useState('')
  const [operatorName, setOperatorName] = useState('')
  const [bulkFermentTemp, setBulkFermentTemp] = useState('')
  const [bulkFermentTime, setBulkFermentTime] = useState('')
  const [machines, setMachines] = useState([
    { id: 1, name: 'M40T' },
    { id: 2, name: '乔立10L' },
    { id: 3, name: '佳麦7L' }
  ])
  const [doughTypes, setDoughTypes] = useState([
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
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      const [records, machinesData, doughTypesData] = await Promise.all([
        fetchRecords(),
        fetchMachines(),
        fetchDoughTypes()
      ])
      setBatchNumber(getPreviewBatchNumber(records))
      if (machinesData.length > 0) setMachines(machinesData)
      if (doughTypesData.length > 0) setDoughTypes(doughTypesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  async function handleSave() {
    if (!doughName) {
      setAlert('请选择面团种类')
      return
    }
    if (!dryTemp) {
      setAlert('请填写干料温度')
      return
    }
    if (!roomTemp) {
      setAlert('请填写室温')
      return
    }
    if (!waterTemp) {
      setAlert('请填写水温')
      return
    }
    if (!flourAmount || parseFloat(flourAmount) <= 0) {
      setAlert('请填写面粉用量（需大于0）')
      return
    }
    if (!waterAmount || parseFloat(waterAmount) <= 0) {
      setAlert('请填写水量（需大于0）')
      return
    }
    if (!outputTemp || parseFloat(outputTemp) <= 0) {
      setAlert('请填写出缸温度（需大于0）')
      return
    }
    if (!machine) {
      setAlert('请选择打面设备')
      return
    }
    if (glutenLevel && (parseFloat(glutenLevel) <= 0 || parseFloat(glutenLevel) > 15)) {
      setAlert('出缸面筋需大于0且不超过15')
      return
    }

    setSaving(true)

    try {
      const existingRecords = await fetchRecords()
      if (existingRecords.some(r => r.batch_number === batchNumber)) {
        const newBatchNumber = getPreviewBatchNumber()
        setBatchNumber(newBatchNumber)
        setAlert(`批次号已存在，已自动更新为 ${newBatchNumber}`)
        setSaving(false)
        return
      }
    } catch (error) {
      setAlert(`检查批次号失败: ${error.message}`)
      setSaving(false)
      return
    }

    const record = {
      batch_number: batchNumber,
      dough_name: doughName,
      dry_temp: parseFloat(dryTemp) || null,
      room_temp: parseFloat(roomTemp) || null,
      ice_ratio: parseFloat(iceRatio) || null,
      water_temp: parseFloat(waterTemp) || null,
      flour_amount: parseFloat(flourAmount) || null,
      water_amount: parseFloat(waterAmount) || null,
      machine_speed: machineSpeed || null,
      gluten_level: parseFloat(glutenLevel) || null,
      output_temp: parseFloat(outputTemp) || null,
      machine: machine,
      operator: operatorName || null,
      bulk_ferment_temp: parseFloat(bulkFermentTemp) || null,
      bulk_ferment_time: parseInt(bulkFermentTime) || null
    }

    try {
      await createRecord(record)
      reserveBatchNumber()
      setAlert('保存成功')
      if (onSuccess) onSuccess()
    } catch (error) {
      setAlert(`保存失败: ${error.message}`)
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
        <span className="page-title">新建记录</span>
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
          <span className="value">{batchNumber}</span>
        </div>
        <div className="form-row">
          <label>面团种类</label>
          <div className="picker-wrapper">
            <select value={doughName} onChange={e => setDoughName(e.target.value)}>
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
            placeholder="请输入" 
            value={operatorName}
            onChange={e => setOperatorName(e.target.value)}
          />
        </div>
      </div>

      <div className="section-header">温度记录</div>
      <div className="form-section">
        <div className="form-row">
          <label>干料温度</label>
          <input 
            type="number" 
            placeholder="°C" 
            value={dryTemp}
            onChange={e => setDryTemp(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>室温</label>
          <input 
            type="number" 
            placeholder="°C" 
            value={roomTemp}
            onChange={e => setRoomTemp(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>水温</label>
          <input 
            type="number" 
            placeholder="°C" 
            value={waterTemp}
            onChange={e => setWaterTemp(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>出缸温度</label>
          <input 
            type="number" 
            placeholder="°C" 
            value={outputTemp}
            onChange={e => setOutputTemp(e.target.value)}
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
              placeholder="请输入" 
              value={iceRatio}
              onChange={e => setIceRatio(e.target.value)}
              style={{ width: '60px', textAlign: 'right' }}
            />
            <span style={{ color: 'var(--color-ios-gray)', fontSize: '17px' }}>%</span>
          </div>
        </div>
        <div className="form-row">
          <label>面粉用量</label>
          <input 
            type="number" 
            placeholder="kg" 
            value={flourAmount}
            onChange={e => setFlourAmount(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>水量</label>
          <input 
            type="number" 
            placeholder="L" 
            value={waterAmount}
            onChange={e => setWaterAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="section-header">打面设备</div>
      <div className="form-section">
        <div className="form-row">
          <label>机器转速/流程</label>
          <input 
            type="text" 
            placeholder="请输入" 
            value={machineSpeed}
            onChange={e => setMachineSpeed(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>打面设备</label>
          <div className="picker-wrapper">
            <select value={machine} onChange={e => setMachine(e.target.value)}>
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
            placeholder="请输入" 
            value={glutenLevel}
            onChange={e => setGlutenLevel(e.target.value)}
          />
        </div>
      </div>

      <div className="section-header">发酵设置</div>
      <div className="form-section">
        <div className="form-row">
          <label>Bulk发酵温度</label>
          <input 
            type="number" 
            placeholder="°C" 
            value={bulkFermentTemp}
            onChange={e => setBulkFermentTemp(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Bulk发酵时间</label>
          <input 
            type="number" 
            placeholder="分钟" 
            value={bulkFermentTime}
            onChange={e => setBulkFermentTime(e.target.value)}
          />
        </div>
      </div>

      {alert && <div className="alert">{alert}</div>}
    </div>
  )
}

export default NewRecordView