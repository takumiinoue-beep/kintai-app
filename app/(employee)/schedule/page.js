'use client'
import { useEffect, useState } from 'react'

const TYPE_OPTIONS = [
  { value: 'work',       label: '出勤希望' },
  { value: 'holiday',    label: '休み希望' },
  { value: 'paid_leave', label: '有給休暇' },
  { value: 'half_day',   label: '半休' },
]
const TYPE_COLOR = {
  work:       { bg: '#dbeafe', text: '#1d4ed8' },
  holiday:    { bg: '#fee2e2', text: '#dc2626' },
  paid_leave: { bg: '#ede9fe', text: '#7c3aed' },
  half_day:   { bg: '#fef9c3', text: '#a16207' },
}
const STATUS_COLOR = {
  pending:  { bg: '#f3f4f6', text: '#6b7280' },
  approved: { bg: '#dcfce7', text: '#15803d' },
  rejected: { bg: '#fee2e2', text: '#dc2626' },
}
const STATUS_LABEL = { pending: '審査中', approved: '承認', rejected: '却下' }
const DOW = ['日', '月', '火', '水', '木', '金', '土']

function toYM(d) { return d.toISOString().slice(0, 7) }
function toDate(d) { return d.toISOString().slice(0, 10) }
function fmtTime(iso) { return iso ? new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '' }
function fmtMin(m) { if (!m) return ''; return `${Math.floor(m/60)}h${m%60>0?m%60+'m':''}` }

function getMonthDays(ym) {
  const [y, m] = ym.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return Array.from({ length: last }, (_, i) => {
    const d = new Date(y, m - 1, i + 1)
    return { date: toDate(d), dow: d.getDay(), day: i + 1 }
  })
}

export default function SchedulePage() {
  const [employee, setEmployee] = useState(null)
  const [requests, setRequests] = useState([])
  const [records, setRecords] = useState([])
  const [month, setMonth] = useState(toYM(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [formCategory, setFormCategory] = useState('shift')
  const [form, setForm] = useState({ request_date: '', request_type: 'work', preferred_start: '', preferred_end: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const emp = localStorage.getItem('kintai_employee')
    if (emp) {
      const parsed = JSON.parse(emp)
      setEmployee(parsed)
      loadData(parsed.id, month)
    }
  }, [month])

  async function loadData(empId, ym) {
    const id = empId || employee?.id
    if (!id) return
    const [shiftRes, attendRes] = await Promise.all([
      fetch(`/api/shift?employee_id=${id}&month=${ym}`),
      fetch(`/api/attendance?employee_id=${id}&month=${ym}`),
    ])
    const shiftData = await shiftRes.json()
    const attendData = await attendRes.json()
    setRequests(Array.isArray(shiftData) ? shiftData : [])
    setRecords(Array.isArray(attendData) ? attendData : [])
  }

  function openForm(dateStr, existing) {
    setFormCategory('shift')
    setForm({
      request_date: dateStr,
      request_type: existing?.request_type || 'work',
      preferred_start: existing?.preferred_start || '',
      preferred_end: existing?.preferred_end || '',
      note: existing?.note || '',
    })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, employee_id: employee.id, request_category: formCategory }),
      })
      if (res.ok) {
        setMsg('申請しました')
        setShowForm(false)
        await loadData(employee.id, month)
        setTimeout(() => setMsg(''), 3000)
      }
    } finally { setSaving(false) }
  }

  const days = getMonthDays(month)
  const reqMap = {}
  requests.forEach(r => { reqMap[r.request_date] = r })
  const recMap = {}
  records.forEach(r => { recMap[r.work_date] = r })

  const [y, m] = month.split('-').map(Number)
  const today = toDate(new Date())

  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', fontSize: 14 }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 6, padding: '10px 16px', fontSize: 14, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {/* ヘッダー */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => { const d = new Date(y, m-2, 1); setMonth(toYM(d)) }}
              style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>◀</button>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{y}年{m}月</span>
            <button onClick={() => { const d = new Date(y, m, 1); setMonth(toYM(d)) }}
              style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>▶</button>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>日付をクリックして申請</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['日付', '曜日', '出勤', '退勤', '実働', 'シフト申請'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 12, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(({ date, dow, day }) => {
              const req = reqMap[date]
              const rec = recMap[date]
              const isToday = date === today
              const isSun = dow === 0
              const isSat = dow === 6
              const rowBg = isToday ? '#eff6ff' : 'white'
              const dowColor = isSun ? '#dc2626' : isSat ? '#2563eb' : '#374151'
              const typeC = req ? (req.request_category === 'correction' ? { bg: '#ffedd5', text: '#c2410c' } : TYPE_COLOR[req.request_type]) : null
              const statusC = req ? STATUS_COLOR[req.status] : null

              return (
                <tr key={date} onClick={() => openForm(date, req)}
                  style={{ background: rowBg, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isToday ? '#dbeafe' : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                  <td style={{ ...tdStyle, fontWeight: isToday ? 600 : 400, color: '#111827' }}>{m}/{day}</td>
                  <td style={{ ...tdStyle, color: dowColor, fontWeight: 500 }}>{DOW[dow]}</td>
                  <td style={{ ...tdStyle, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
                    {rec?.clock_in ? fmtTime(rec.clock_in) : ''}
                  </td>
                  <td style={{ ...tdStyle, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>
                    {rec?.clock_out ? fmtTime(rec.clock_out) : ''}
                  </td>
                  <td style={{ ...tdStyle, color: '#374151' }}>
                    {rec?.work_minutes ? fmtMin(rec.work_minutes) : ''}
                    {rec?.overtime_minutes > 0 && (
                      <span style={{ fontSize: 11, color: '#d97706', marginLeft: 4 }}>+{fmtMin(rec.overtime_minutes)}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle }}>
                    {req ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: typeC?.bg, color: typeC?.text, fontWeight: 500 }}>
                          {req.request_category === 'correction' ? '修正依頼' : TYPE_OPTIONS.find(t => t.value === req.request_type)?.label}
                        </span>
                        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: statusC?.bg, color: statusC?.text }}>
                          {STATUS_LABEL[req.status]}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#d1d5db' }}>— 申請する</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 申請フォーム */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 420, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{form.request_date} の申請</div>
              <button onClick={() => setShowForm(false)} style={{ fontSize: 22, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button onClick={() => setFormCategory('shift')} style={{
                flex: 1, padding: '8px', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                background: formCategory === 'shift' ? '#16a34a' : 'white',
                color: formCategory === 'shift' ? 'white' : '#374151',
                borderColor: formCategory === 'shift' ? '#16a34a' : '#e5e7eb',
              }}>シフト申請</button>
              <button onClick={() => setFormCategory('correction')} style={{
                flex: 1, padding: '8px', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                background: formCategory === 'correction' ? '#c2410c' : 'white',
                color: formCategory === 'correction' ? 'white' : '#374151',
                borderColor: formCategory === 'correction' ? '#c2410c' : '#e5e7eb',
              }}>修正依頼</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formCategory === 'shift' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>種別</label>
                    <select value={form.request_type} onChange={e => setForm(f => ({ ...f, request_type: e.target.value }))}
                      style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', fontSize: 14 }}>
                      {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  {form.request_type === 'work' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>希望出勤</label>
                        <input type="time" value={form.preferred_start} onChange={e => setForm(f => ({ ...f, preferred_start: e.target.value }))}
                          style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', fontSize: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>希望退勤</label>
                        <input type="time" value={form.preferred_end} onChange={e => setForm(f => ({ ...f, preferred_end: e.target.value }))}
                          style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', fontSize: 14 }} />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {formCategory === 'correction' ? '修正内容・理由 *' : 'メモ'}
                </label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  rows={3} required={formCategory === 'correction'}
                  placeholder={formCategory === 'correction' ? '例：打刻を忘れました。実際は9:00〜18:00です。' : ''}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', fontSize: 14, resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 14, cursor: 'pointer', background: 'white', color: '#374151' }}>
                  キャンセル
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    background: formCategory === 'correction' ? '#c2410c' : '#16a34a', color: 'white', opacity: saving ? 0.6 : 1 }}>
                  {saving ? '送信中...' : '申請する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
