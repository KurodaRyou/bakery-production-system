import { useState, useEffect } from 'react'
import { fetchRecords, fetchRecipes } from '../services/api'
import RecordDetailView from './RecordDetailView'
import { getCache, setCache } from '../services/cache'

const CACHE_KEY = 'records_cache'
const CACHE_RECIPES_KEY = 'recipes_cache'

function RecordListView({ onNewRecord, onShowNewButton, showHeader = true, onRefresh }) {
  const [records, setRecords] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    const cachedRecords = getCache(CACHE_KEY)
    const cachedRecipes = getCache(CACHE_RECIPES_KEY)
    
    if (cachedRecords) {
      setRecords(cachedRecords)
    }
    if (cachedRecipes) {
      setRecipes(cachedRecipes)
    }
    
    loadRecords()
  }, [])

  useEffect(() => {
    if (onShowNewButton) {
      onShowNewButton(selectedRecord === null)
    }
  }, [selectedRecord, onShowNewButton])

  async function loadRecords() {
    try {
      const [data, recipesData] = await Promise.all([fetchRecords(), fetchRecipes()])
      const sortedRecords = [...data].sort((a, b) => a.batch_number.localeCompare(b.batch_number))
      
      setCache(CACHE_KEY, sortedRecords)
      setCache(CACHE_RECIPES_KEY, recipesData)
      
      // Only update state if data actually changed
      setRecords(prev => {
        if (prev.length !== sortedRecords.length || 
            prev[0]?.id !== sortedRecords[0]?.id ||
            prev[0]?.batch_number !== sortedRecords[0]?.batch_number) {
          return sortedRecords
        }
        return prev
      })
      
      setRecipes(prev => {
        if (prev.length !== recipesData.length || prev[0]?.id !== recipesData[0]?.id) {
          return recipesData
        }
        return prev
      })
    } catch (error) {
      console.error('Failed to load records:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExpectedTemp = (doughName) => {
    const recipe = recipes.find(r => r.name === doughName)
    return recipe?.expected_temp ?? null
  }

  const getStatusColor = (output_temp, expected_temp) => {
    if (!output_temp || expected_temp == null) return null
    const diff = output_temp - expected_temp
    if (diff > 1) return { text: 'var(--color-danger)', bg: 'rgba(220, 38, 38, 0.1)' }
    if (diff < -1) return { text: 'var(--color-info)', bg: 'rgba(37, 99, 235, 0.1)' }
    return { text: 'var(--color-success)', bg: 'rgba(22, 163, 74, 0.1)' }
  }

  const formatDateFromBatch = (batchNumber) => {
    const dateStr = batchNumber.substring(0, 8)
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${parseInt(month)}月${parseInt(day)}日`
  }

  const groupRecordsByDate = () => {
    const groups = {}
    records.forEach(record => {
      const dateKey = record.batch_number.substring(0, 8)
      if (!groups[dateKey]) {
        groups[dateKey] = {
          label: formatDateFromBatch(record.batch_number),
          records: []
        }
      }
      groups[dateKey].records.push(record)
    })
    return Object.values(groups).sort((a, b) => {
      const aDate = a.records[0]?.batch_number.substring(0, 8)
      const bDate = b.records[0]?.batch_number.substring(0, 8)
      return bDate.localeCompare(aDate)
    })
  }

  const groupedRecords = groupRecordsByDate()

  return (
    <div>
      {showHeader && (
        <div className="page-header">
          <div className="page-header-left">
            <span style={{ width: 60 }}></span>
          </div>
          <span className="page-title">打面记录</span>
          <button className="back-btn" onClick={onRefresh || loadRecords} style={{ minWidth: 60, justifyContent: 'flex-end' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 4 }}>
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            刷新
          </button>
        </div>
      )}
      
      {selectedRecord ? (
        <RecordDetailView
          record={selectedRecord}
          onBack={() => setSelectedRecord(null)}
          showHeader={false}
        />
      ) : loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
          <p>暂无记录</p>
          <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>点击下方按钮新建</p>
        </div>
      ) : (
        <div className="timeline-container">
          {groupedRecords.map((group, groupIndex) => (
            <div key={groupIndex} className="timeline-group">
              <div className="timeline-date">{group.label}</div>
              <div className="timeline-items">
                {group.records.map((record, index) => (
                  <div 
                    key={record.batch_number} 
                    className="timeline-item"
                    onClick={() => setSelectedRecord(record)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="timeline-marker">
                      <div className="timeline-dot"></div>
                      {index < group.records.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-batch">{record.dough_name}</span>
                        {(() => {
                            const statusColor = getStatusColor(record.output_temp, record.expected_temp)
                            return statusColor
                              ? <span className="timeline-status" style={{ color: statusColor.text, background: statusColor.bg }}>完成</span>
                              : <span className="timeline-status">完成</span>
                          })()}
                      </div>
                      <div className="timeline-body">
                        <span className="timeline-dough">批次 {record.batch_number}</span>
                        {record.output_temp && (
                          <span className="timeline-temp">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                            </svg>
                            {record.output_temp}°C
                          </span>
                        )}
                      </div>
                      {record.operator && (
                        <div className="timeline-footer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {record.operator}
                        </div>
                      )}
                    </div>
                    <div className="timeline-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
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

export default RecordListView