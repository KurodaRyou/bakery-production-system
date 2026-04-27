import { useState, useEffect } from 'react'

const mockDevices = [
  { id: 1, name: '醒发箱-A', location: '后厨', type: 'proofer', temp: 32.5, humidity: 78, status: 'normal' },
  { id: 2, name: '醒发箱-B', location: '后厨', type: 'proofer', temp: 28.1, humidity: 82, status: 'normal' },
  { id: 3, name: '冰箱-冷藏', location: '冷区', type: 'fridge', temp: 3.2, humidity: 45, status: 'normal' },
  { id: 4, name: '冰箱-冷冻', location: '冷区', type: 'freezer', temp: -18.5, humidity: 30, status: 'normal' },
  { id: 5, name: '后厨环境', location: '操作间', type: 'ambient', temp: 24.8, humidity: 62, status: 'normal' },
]

function MonitorDashboard() {
  const [devices, setDevices] = useState(mockDevices)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    setLoading(false)
    const timer = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return { bg: 'rgba(22, 163, 74, 0.1)', text: 'var(--color-success)', border: 'var(--color-success)' }
      case 'warning': return { bg: 'rgba(234, 179, 8, 0.1)', text: 'var(--color-warning-light)', border: 'var(--color-warning-light)' }
      case 'alert': return { bg: 'rgba(220, 38, 38, 0.1)', text: 'var(--color-danger)', border: 'var(--color-danger)' }
      default: return { bg: 'rgba(139, 115, 85, 0.1)', text: 'var(--color-text-muted)', border: 'var(--color-text-muted)' }
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'proofer': return '醒发箱'
      case 'fridge': return '冷藏冰箱'
      case 'freezer': return '冷冻冰箱'
      case 'ambient': return '后厨环境'
      default: return type
    }
  }

  const statusLabels = {
    normal: '正常',
    warning: '预警',
    alert: '报警'
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-display)' }}>环境监控</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>当前时间</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', letterSpacing: 2 }}>
            {lastUpdate.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {devices.map(device => {
          const statusStyle = getStatusColor(device.status)
          return (
            <div 
              key={device.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 12,
                padding: 14,
                border: `1px solid var(--color-border)`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{device.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {getTypeLabel(device.type)} · {device.location}
                  </div>
                </div>
                <span 
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: statusStyle.bg,
                    color: statusStyle.text
                  }}
                >
                  {statusLabels[device.status]}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>温度</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {device.temp > 0 ? device.temp.toFixed(1) : device.temp.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 500 }}>°C</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>湿度</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {device.humidity}<span style={{ fontSize: 14, fontWeight: 500 }}>%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, padding: 14, background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>温度趋势（7天）</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
          {[65, 72, 68, 75, 70, 78, 82, 76, 80, 74, 71, 68, 72, 85].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v}%`, background: 'var(--color-primary)', borderRadius: 2, opacity: 0.6 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span>3/19</span>
          <span>3/25</span>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 14, background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>报警记录</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
          暂无报警记录
        </div>
      </div>
    </div>
  )
}

export default MonitorDashboard