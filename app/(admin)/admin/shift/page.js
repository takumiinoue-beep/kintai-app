'use client'
import { useEffect, useState } from 'react'

const TYPE_LABEL = { work: '出勤', holiday: '休み', paid_leave: '有給', half_day: '半休' }
const TYPE_COLOR = { work: 'bg-green-100 text-green-700', holiday: 'bg-red-100 text-red-700', paid_leave: 'bg-purple-100 text-purple-700', half_day: 'bg-yellow-100 text-yellow-700' }
const STATUS_COLOR = { pending: 'bg-gray-100 text-gray-600', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }
const STATUS_LABEL = { pending: '審査中', approved: '承認済', rejected: '却下' }

function nextMonth() { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 7) }

export default function AdminShift() {
  const [requests, setRequests] = useState([])
  const [month, setMonth] = useState(nextMonth())
  const [processing, setProcessing] = useState(null)

  useEffect(() => { loadRequests() }, [month])

  async function loadRequests() {
    const res = await fetch(`/api/shift?all=1&month=${month}`)
    setRequests(await res.json())
  }

  async function handleAction(id, action, adminNote = '') {
    setProcessing(id)
    await fetch('/api/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, admin_note: adminNote }),
    })
    await loadRequests()
    setProcessing(null)
  }

  const pending = requests.filter(r => r.status === 'pending')
  const done    = requests.filter(r => r.status !== 'pending')

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">←</a>
        <h1 className="text-xl font-bold text-gray-900">シフト申請管理</h1>
      </div>

      <input type="month" className="input w-auto mb-4" value={month} onChange={e => setMonth(e.target.value)} />

      {/* 未対応 */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">未対応 ({pending.length}件)</h2>
          <div className="space-y-3">
            {pending.map(req => (
              <div key={req.id} className="card border-l-4 border-amber-400">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{req.employees?.name}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{req.request_date}</div>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[req.request_type]}`}>{TYPE_LABEL[req.request_type]}</span>
                      {req.preferred_start && <span className="text-xs text-gray-500">{req.preferred_start}〜{req.preferred_end}</span>}
                    </div>
                    {req.note && <div className="text-xs text-gray-400 mt-1">{req.note}</div>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAction(req.id, 'approve')}
                      disabled={processing === req.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium"
                    >承認</button>
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      disabled={processing === req.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
                    >却下</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 対応済み */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">対応済み</h2>
          <div className="space-y-2">
            {done.map(req => (
              <div key={req.id} className="card py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700">{req.employees?.name}</div>
                    <div className="text-xs text-gray-500">{req.request_date}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[req.request_type]}`}>{TYPE_LABEL[req.request_type]}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[req.status]}`}>{STATUS_LABEL[req.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="card text-center py-10 text-gray-400">申請がありません</div>
      )}
    </div>
  )
}
