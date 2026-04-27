import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

const mockWorkflow = {
  user: '张三',
  shift: '早班',
  tasks: [
    { id: 1, time: '06:00', duration: 90, task_type: '打面', product: '越南法棍', status: 'completed', start: '06:00', end: '07:30' },
    { id: 2, time: '07:30', duration: 30, task_type: '整形', product: '越南法棍', status: 'running', progress: 60, start: '07:30', end: '08:00' },
    { id: 3, time: '08:00', duration: 60, task_type: '准备馅料', product: '甜面团', status: 'pending', start: '08:00', end: '09:00' },
    { id: 4, time: '09:00', duration: 45, task_type: '打面', product: '贝果', status: 'pending', start: '09:00', end: '09:45' },
  ]
}

const taskTypeLabels = {
  '打面': '🥣',
  '整形': '🍞',
  '醒发': '⏰',
  '准备馅料': '🥄',
  '烘烤': '🔥',
  '其他': '📋'
}

const taskTypeColors = {
  '打面': 'var(--color-ios-blue)',
  '整形': 'var(--color-ios-green)',
  '醒发': 'var(--color-ios-orange)',
  '准备馅料': 'var(--color-ios-purple)',
  '烘烤': 'var(--color-ios-red)',
  '其他': 'var(--color-ios-gray)'
}

function WorkClock() {
  const user = useAuthStore((s) => s.user)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [workflow] = useState(mockWorkflow)
  const displayName = user?.name || user?.username || '未登录'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentTask = workflow.tasks.find(t => t.status === 'running')
  const nextTask = workflow.tasks.find(t => t.status === 'pending')

  const getTimeRemaining = (endTime) => {
    const [hours, minutes] = endTime.split(':').map(Number)
    const end = new Date(currentTime)
    end.setHours(hours, minutes, 0, 0)
    const diff = end - currentTime
    if (diff <= 0) return 0
    return Math.round(diff / 60000)
  }

  const getProgressForCurrent = () => {
    if (!currentTask) return 0
    const [startH, startM] = currentTask.start.split(':').map(Number)
    const [endH, endM] = currentTask.end.split(':').map(Number)
    const start = new Date(currentTime)
    start.setHours(startH, startM, 0, 0)
    const end = new Date(currentTime)
    end.setHours(endH, endM, 0, 0)
    const total = end - start
    const elapsed = currentTime - start
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  }

  const getNextStartIn = () => {
    if (!nextTask) return null
    const [hours, minutes] = nextTask.start.split(':').map(Number)
    const start = new Date(currentTime)
    start.setHours(hours, minutes, 0, 0)
    const diff = start - currentTime
    if (diff <= 0) return 0
    return Math.round(diff / 60000)
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-display)', margin: 0 }}>工作时钟</h2>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {displayName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>当前时间</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', letterSpacing: 2 }}>
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
        </div>
      </div>

      {currentTask ? (
        <div style={{ 
          background: 'var(--color-surface)', 
          borderRadius: 16, 
          padding: 20, 
          border: '2px solid var(--color-primary)',
          marginBottom: 16 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 24, marginRight: 10 }}>{taskTypeLabels[currentTask.task_type] || '📋'}</span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 2 }}>进行中</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{currentTask.task_type} · {currentTask.product}</div>
            </div>
          </div>
          
          <div style={{ background: 'var(--color-bg)', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ 
              background: 'var(--color-primary)', 
              height: '100%', 
              width: `${getProgressForCurrent()}%`,
              transition: 'width 1s linear'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
            <span>{getProgressForCurrent()}%</span>
            <span>剩余 {Math.max(0, getTimeRemaining(currentTask.end))} 分钟</span>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--color-surface)', 
          borderRadius: 16, 
          padding: 20, 
          border: '1px solid var(--color-border)',
          marginBottom: 16,
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          当前无进行中的工作
        </div>
      )}

      {nextTask && (
        <div style={{ 
          background: 'var(--color-surface)', 
          borderRadius: 16, 
          padding: 16, 
          border: '1px solid var(--color-border)',
          marginBottom: 16 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 20, marginRight: 10 }}>{taskTypeLabels[nextTask.task_type] || '📋'}</span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>下一个</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{nextTask.task_type} · {nextTask.product}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{nextTask.start}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {getNextStartIn() > 0 ? `${getNextStartIn()} 分钟后` : '即将开始'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        background: 'var(--color-surface)', 
        borderRadius: 12, 
        padding: 14, 
        border: '1px solid var(--color-border)' 
      }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>今日工作</div>
        
        {(() => {
          const hour = currentTime.getHours()
          const rangeStart = hour < 11 ? 5 : 11
          const rangeEnd = hour < 11 ? 11 : 17
          const totalHours = rangeEnd - rangeStart
          
          const getPosition = (taskHour, taskMin) => {
            const minutes = (taskHour - rangeStart) * 60 + taskMin
            return (minutes / (totalHours * 60)) * 100
          }
          
          const getWidth = (startH, startM, endH, endM) => {
            const startMin = (startH - rangeStart) * 60 + startM
            const endMin = (endH - rangeStart) * 60 + endM
            const duration = endMin - startMin
            return Math.max((duration / (totalHours * 60)) * 100, 2)
          }
          
          const nowPosition = ((hour - rangeStart + currentTime.getMinutes() / 60) / totalHours) * 100
          const showNowLine = hour >= rangeStart && hour < rangeEnd
          
          const tasksByProduct = workflow.tasks.reduce((acc, task) => {
            if (!acc[task.product]) {
              acc[task.product] = []
            }
            acc[task.product].push(task)
            return acc
          }, {})
          
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 60 }} />
                <div style={{ flex: 1, position: 'relative', height: 16 }}>
                  <span style={{ position: 'absolute', left: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>{rangeStart}:00</span>
                  <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--color-text-muted)' }}>{rangeStart + 3}:00</span>
                  <span style={{ position: 'absolute', right: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>{rangeEnd}:00</span>
                </div>
              </div>
              
              {Object.entries(tasksByProduct).map(([product, tasks]) => {
                const sortedTasks = tasks.sort((a, b) => a.start.localeCompare(b.start))
                return (
                  <div key={product} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ width: 60, fontSize: 12, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product}
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: 28, background: 'var(--color-bg)', borderRadius: 6 }}>
                      {showNowLine && (
                        <div style={{
                          position: 'absolute',
                          left: `${nowPosition}%`,
                          top: -2,
                          bottom: -2,
                          width: 2,
                          background: 'var(--color-ios-red)',
                          zIndex: 20
                        }} />
                      )}
                      {sortedTasks.map(task => {
                        const [startH, startM] = task.start.split(':').map(Number)
                        const [endH, endM] = task.end.split(':').map(Number)
                        const taskLeft = getPosition(startH, startM)
                        const taskWidth = getWidth(startH, startM, endH, endM)
                        const baseColor = taskTypeColors[task.task_type] || taskTypeColors['其他']
                        
                        if (taskLeft + taskWidth < 0 || taskLeft > 100) return null
                        
                        const isRunning = task.status === 'running'
                        const isCompleted = task.status === 'completed'
                        const isPending = task.status === 'pending'
                        
                        return (
                          <div
                            key={task.id}
                            style={{
                              position: 'absolute',
                              left: `${taskLeft}%`,
                              width: `${taskWidth}%`,
                              top: 2,
                              bottom: 2,
                              background: baseColor,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 6,
                              paddingRight: 6,
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                              opacity: isPending ? 0.4 : 1,
                              zIndex: isRunning ? 15 : 5
                            }}
                          >
                            <span style={{ fontSize: 10, color: 'var(--color-surface)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {task.task_type}
                            </span>
                            {isRunning && (
                              <div style={{
                                position: 'absolute',
                                right: 6,
                                width: 6,
                                height: 6,
                                background: 'var(--color-surface)',
                                borderRadius: '50%'
                              }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', fontSize: 11 }}>
                {Object.entries(taskTypeColors).map(([type, color]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{type}</span>
                  </div>
                ))}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

export default WorkClock