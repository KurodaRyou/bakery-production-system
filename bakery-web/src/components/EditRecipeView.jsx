import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateRecipe, fetchMaterials } from '../services/api'

function SortableMaterialRow({ mat, onRemove, onUpdate, searchValue, handleSearchChange, selectMaterial, showDropdown, setShowDropdown, getFilteredMaterials, typeLabels, onFocusReload }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mat.sortableId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="ingredient-row">
      <div className="drag-handle" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className="ingredient-inputs">
        <div className="ingredient-search-wrapper">
          <input
            type="text"
            placeholder="搜索或输入材料名称"
            value={searchValue[mat.index] || mat.material_name || ''}
            onChange={e => handleSearchChange(mat.index, e.target.value)}
            onFocus={() => { onFocusReload(); setShowDropdown(prev => ({ ...prev, [mat.index]: true })) }}
          />
          {showDropdown[mat.index] && getFilteredMaterials(mat.index).length > 0 && (
            <div className="ingredient-dropdown">
              {getFilteredMaterials(mat.index).map(item => (
                <div
                  key={item.id}
                  className="ingredient-dropdown-item"
                  onClick={() => selectMaterial(mat.index, item)}
                >
                  {item.name} <span style={{ fontSize: '12px', color: 'var(--color-ios-gray)' }}>({typeLabels[item.type] || item.type})</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ingredient-row-inline">
          <span style={{ color: 'var(--color-ios-gray)', fontSize: '17px', minWidth: '70px' }}>添加量</span>
          <input
            type="number"
            placeholder="0"
            value={mat.percentage}
            onChange={e => onUpdate(mat.index, 'percentage', e.target.value)}
            style={{ width: '60px', textAlign: 'right' }}
          />
          <span style={{ color: 'var(--color-ios-gray)', fontSize: '17px' }}>%</span>
        </div>
      </div>
      <button
        className="ingredient-remove"
        onClick={() => onRemove(mat.index)}
      >
        ×
      </button>
    </div>
  )
}

function EditRecipeView({ recipe, onBack, onSuccess }) {
  const [name, setName] = useState(recipe.name || '')
  const [author, setAuthor] = useState(recipe.author || '')
  const [expected_temp, setExpectedTemp] = useState(recipe.expected_temp ? String(recipe.expected_temp) : '')
  const [loss_rate, setLossRate] = useState(recipe.loss_rate ? String(recipe.loss_rate) : '1.00')
  const [materials, setMaterials] = useState(
    recipe.ingredients?.map((ing, idx) => ({
      stage: ing.stage,
      material_id: ing.material_id || '',
      material_name: ing.material_name || '',
      material_type: ing.material_type || '',
      percentage: ing.percentage || '',
      note: ing.note || '',
      unit: ing.unit || '',
      sortableId: ing.sortableId || `edit-${idx}-${Date.now()}`
    })) || [
      { stage: 'preferment', material_id: '', material_name: '', percentage: '', note: '', unit: '', sortableId: `edit-init-${Date.now()}` }
    ]
  )
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState('')
  const [allMaterials, setAllMaterials] = useState([])
  const [searchValue, setSearchValue] = useState({})
  const [showDropdown, setShowDropdown] = useState({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    loadMaterials()
  }, [])

  async function loadMaterials() {
    try {
      const data = await fetchMaterials()
      setAllMaterials(data)
    } catch (error) {
      console.error('Failed to load materials:', error)
    }
  }

  function addMaterial(stage) {
    const newId = `edit-new-${Date.now()}`
    setMaterials([
      ...materials,
      { stage, material_id: '', material_name: '', percentage: '', note: '', unit: '', sortableId: newId }
    ])
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = materials.findIndex(m => m.sortableId === active.id)
    const newIndex = materials.findIndex(m => m.sortableId === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newMaterials = [...materials]
    const [removed] = newMaterials.splice(oldIndex, 1)
    newMaterials.splice(newIndex, 0, removed)
    setMaterials(newMaterials)
  }

  function updateMaterial(index, field, value) {
    const updated = [...materials]
    updated[index][field] = value
    setMaterials(updated)
  }

  function removeMaterial(index) {
    const newMaterials = materials.filter((_, i) => i !== index)
    setMaterials(newMaterials)
    const newSearch = {}
    const newShow = {}
    newMaterials.forEach((_, newIdx) => {
      newSearch[newIdx] = ''
      newShow[newIdx] = false
    })
    setSearchValue(newSearch)
    setShowDropdown(newShow)
  }

  function handleSearchChange(index, value) {
    setSearchValue(prev => ({ ...prev, [index]: value }))
    setShowDropdown(prev => ({ ...prev, [index]: true }))
    if (!value) {
      updateMaterial(index, 'material_id', '')
      updateMaterial(index, 'material_name', '')
      updateMaterial(index, 'material_type', '')
    }
  }

  function selectMaterial(index, material) {
    updateMaterial(index, 'material_id', material.id)
    updateMaterial(index, 'material_name', material.name)
    updateMaterial(index, 'material_type', material.type)
    setSearchValue(prev => ({ ...prev, [index]: material.name }))
    setShowDropdown(prev => ({ ...prev, [index]: false }))
  }

  function getFilteredMaterials(index) {
    const search = searchValue[index] || ''
    if (!search) return []
    const mat = materials[index]
    const stage = mat?.stage || 'base'
    if (stage === 'preferment') {
      return allMaterials.filter(mat => 
        mat.name.toLowerCase().includes(search.toLowerCase()) && mat.type === 'preparation'
      )
    }
    return allMaterials.filter(mat => 
      mat.name.toLowerCase().includes(search.toLowerCase()) && 
      (mat.type === 'preparation' || mat.type === 'ingredient' || mat.type === 'dough')
    )
  }

  async function handleSave() {
    if (!name) {
      setAlert('请输入配方名称')
      return
    }

    const validMaterials = materials.filter(
      mat => mat.material_id !== ''
    )

    if (validMaterials.length === 0) {
      setAlert('请至少添加一个材料')
      return
    }

    setSaving(true)

    const recipeData = {
      name,
      author: author || null,
      expected_temp: expected_temp ? parseFloat(expected_temp) : null,
      loss_rate: loss_rate ? parseFloat(loss_rate) : 1,
      ingredients: validMaterials.map(mat => ({
        stage: mat.stage,
        material_id: mat.material_id,
        percentage: mat.percentage ? parseFloat(mat.percentage) : null,
        note: mat.note || null,
        unit: mat.unit || null
      }))
    }

    try {
      await updateRecipe(recipe.id, recipeData)
      setAlert('保存成功')
      if (onSuccess) onSuccess()
    } catch (error) {
      setAlert(`保存失败: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const stages = ['preferment', 'base', 'late']
  const stageLabels = { preferment: '预发酵', base: '主面团', late: '后加' }
  const typeLabels = { ingredient: '原材料', preparation: '半成品', dough: '面团' }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="back-btn-text">取消</span>
          </button>
        </div>
        <span className="page-title">编辑配方</span>
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
        <div className="form-row">
          <label>配方名称</label>
          <input 
            type="text" 
            placeholder="请输入" 
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>类型</label>
          <input type="text" value={recipe.material_type === 'dough' ? '面团' : recipe.material_type === 'ingredient' ? '原材料' : recipe.material_type === 'preparation' ? '半成品' : recipe.material_type} readOnly />
        </div>
        <div className="form-row">
          <label>作者</label>
          <input 
            type="text" 
            placeholder="请输入" 
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
        </div>
        {recipe.material_type === 'dough' && (
        <div className="form-row">
          <label>预期出缸温度</label>
          <input 
            type="number" 
            placeholder="如：26" 
            value={expected_temp}
            onChange={e => setExpectedTemp(e.target.value)}
          />
        </div>
      )}
      <div className="form-row">
        <label>损耗率</label>
        <input 
          type="number" 
          step="0.01"
          placeholder="如：0.95" 
          value={loss_rate}
          onChange={e => setLossRate(e.target.value)}
        />
      </div>
      </div>

      {recipe.material_type === 'dough' ? (
        stages.map(stage => {
          const stageMaterials = materials
            .map((mat, index) => ({ ...mat, index }))
            .filter(mat => mat.stage === stage)
          const sortableIds = stageMaterials.map(m => m.sortableId)
          return (
            <div key={stage}>
              <div className="section-header">{stageLabels[stage]}</div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  <div className="form-section">
                    {stageMaterials.map(mat => (
                      <SortableMaterialRow
                        key={mat.sortableId}
                        mat={mat}
                        onRemove={removeMaterial}
                        onUpdate={updateMaterial}
                        searchValue={searchValue}
                        handleSearchChange={handleSearchChange}
                        selectMaterial={selectMaterial}
                        showDropdown={showDropdown}
                        setShowDropdown={setShowDropdown}
                        getFilteredMaterials={getFilteredMaterials}
                        typeLabels={typeLabels}
                        onFocusReload={loadMaterials}
                      />
                    ))}
                    <div
                      className="add-ingredient-btn"
                      onClick={() => addMaterial(stage)}
                    >
                      + 添加材料
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )
        })
      ) : (
        <div>
          <div className="section-header">材料</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={materials.map(m => m.sortableId)} strategy={verticalListSortingStrategy}>
              <div className="form-section">
                {materials.map((mat, index) => (
                  <SortableMaterialRow
                    key={mat.sortableId}
                    mat={{ ...mat, index }}
                    onRemove={removeMaterial}
                    onUpdate={updateMaterial}
                    searchValue={searchValue}
                    handleSearchChange={handleSearchChange}
                    selectMaterial={selectMaterial}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    getFilteredMaterials={getFilteredMaterials}
                    typeLabels={typeLabels}
                  />
                ))}
                <div
                  className="add-ingredient-btn"
                  onClick={() => addMaterial('base')}
                >
                  + 添加材料
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {alert && <div className="alert">{alert}</div>}
    </div>
  )
}

export default EditRecipeView