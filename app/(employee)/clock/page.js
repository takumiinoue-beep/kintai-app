'use client'
import { useEffect, useState } from 'react'

function formatTime(iso) {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}
function fmtMin(m) {
  if (!m) return '0時間'
  return `${Math.floor(m / 60)}時間${m % 60 > 0 ? (m % 60) + '分' : ''}`
}

export default function ClockPage() {
  const [employee, setEmployee] = useState(null)
  const [record, setRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [now, setNow] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const emp = localStorage.getItem('kintai_employee')
    if (emp) {
      const parsed = JSON.parse(emp)
      setEmployee(parsed)
      loadRecord(parsed.id)
      loadHistory(parsed.id)
    }
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  async function loadRecord(empId) {
    const res = await fetch(`/api/attendance?employee_id=${empId}&date=${today}`)
    const data = await res.json()
    setRecord(data)
  }

  async function loadHistory(empId) {
    const month = today.slice(0, 7)
    const res = await fetch(`/api/attendance?employee_id=${empId}&month=${month}`)
    const data = await res.json()
    setHistory(Array.isArray(data) ? data.filter(r => r.clock_in).sort((a, b) => b.work_date.localeCompare(a.work_date)).slice(0, 5) : [])
  }

  async function handleClock(action) {
    setLoading(true)
    setError('')
    setMsg('')
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, employee_id: employee.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMsg(action === 'clock_in' ? '出勤を記録しました' : `退勤を記録しました（実働 ${fmtMin(data.work_minutes)}）`)
      await loadRecord(employee.id)
      await loadHistory(employee.id)
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const hasClockedIn  = !!record?.clock_in
  const hasClockedOut = !!record?.clock_out

  const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* 日時・ボタンカード */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 8 }}>{dateStr}</div>
        <div style={{ fontSize: 56, fontWeight: 300, color: '#111827', fontVariantNumeric: 'tabular-nums', letterSpacing: -1, marginBottom: 36 }}>
          {timeStr}
        </div>

        {/* メッセージ */}
        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 6, padding: '10px 16px', fontSize: 14, marginBottom: 24 }}>
            {msg}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, padding: '10px 16px', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* ボタン */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            onClick={() => handleClock('clock_in')}
            disabled={loading || hasClockedIn}
            style={{
              padding: '12px 48px', fontSize: 16, fontWeight: 600, borderRadius: 6, border: 'none', cursor: hasClockedIn ? 'default' : 'pointer',
              background: hasClockedIn ? '#e5e7eb' : '#1e3a8a', color: hasClockedIn ? '#9ca3af' : 'white', transition: 'background 0.15s',
              minWidth: 140,
            }}
          >出勤</button>
          <button
            onClick={() => handleClock('clock_out')}
            disabled={loading || !hasClockedIn || hasClockedOut}
            style={{
              padding: '12px 48px', fontSize: 16, fontWeight: 600, borderRadius: 6, border: 'none', cursor: (!hasClockedIn || hasClockedOut) ? 'default' : 'pointer',
              background: (!hasClockedIn || hasClockedOut) ? '#e5e7eb' : '#374151', color: (!hasClockedIn || hasClockedOut) ? '#9ca3af' : 'white', transition: 'background 0.15s',
              minWidth: 140,
            }}
          >退勤</button>
        </div>

        {/* 今日の打刻時刻 */}
        {(hasClockedIn || hasClockedOut) && (
          <div style={{ marginTop: 24, display: 'flex', gap: 32, justifyContent: 'center' }}>
            {hasClockedIn && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                出勤：<span style={{ color: '#111827', fontWeight: 600 }}>{formatTime(record.clock_in)}</span>
              </div>
            )}
            {hasClockedOut && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                退勤：<span style={{ color: '#111827', fontWeight: 600 }}>{formatTime(record.clock_out)}</span>
              </div>
            )}
            {hasClockedOut && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                実働：<span style={{ color: '#1e3a8a', fontWeight: 600 }}>{fmtMin(record.work_minutes)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 打刻履歴 */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #e5e7eb', fontSize: 14, fontWeight: 600, color: '#374151' }}>
          最新の打刻
        </div>
        {history.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>打刻記録がありません</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '10px 24px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>日付</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: '#6b7280', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>出勤</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 500, color: '#6b7280', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>退勤</th>
                <th style={{ padding: '10px 24px', textAlign: 'right', fontWeight: 500, color: '#6b7280', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>実働</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 24px', color: '#374151' }}>{r.work_date}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{formatTime(r.clock_in)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{formatTime(r.clock_out)}</td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', color: '#1e3a8a', fontWeight: 500 }}>{fmtMin(r.work_minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
