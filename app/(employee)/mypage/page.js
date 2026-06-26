'use client'
import { useEffect, useState } from 'react'

function fmt(n) { return '¥' + Math.round(n || 0).toLocaleString('ja-JP') }
function fmtMin(m) {
  if (!m) return '0時間'
  return `${Math.floor(m / 60)}時間${m % 60 > 0 ? (m % 60) + '分' : ''}`
}
function thisMonth() { return new Date().toISOString().slice(0, 7) }

export default function MyPage() {
  const [employee, setEmployee] = useState(null)
  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])
  const [month, setMonth] = useState(thisMonth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const emp = localStorage.getItem('kintai_employee')
    if (emp) {
      const parsed = JSON.parse(emp)
      setEmployee(parsed)
      loadSummary(parsed.id)
    }
  }, [month])

  async function loadSummary(empId) {
    setLoading(true)
    const res = await fetch(`/api/summary?employee_id=${empId}&month=${month}`)
    const data = await res.json()
    setSummary(data.summary)
    setRecords(data.records || [])
    setLoading(false)
  }

  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="py-6 space-y-4">
      <h1 className="text-lg font-bold text-gray-900">給与・勤務確認</h1>

      {/* 月切替 */}
      <div className="flex gap-2 overflow-x-auto">
        {months.map(m => (
          <button key={m} onClick={() => setMonth(m)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${month === m ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {m.replace('-', '年')}月
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-8 text-gray-400">読み込み中...</div>
      ) : (
        <>
          {/* 給与サマリ */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">{month.replace('-', '年')}月 給与明細（概算）</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">基本給</span>
                <span className="font-medium">{fmt(summary?.basePay)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">残業手当</span>
                <span className="font-medium">{fmt(summary?.overtimePay)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">深夜割増</span>
                <span className="font-medium">{fmt(summary?.lateNightPay)}</span>
              </div>
              <div className="flex justify-between py-2 pt-2">
                <span className="font-bold text-gray-900">支給合計（概算）</span>
                <span className="font-bold text-indigo-700 text-lg">{fmt(summary?.totalPay)}</span>
              </div>
            </div>
          </div>

          {/* 勤務サマリ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <div className="text-xs text-gray-500 mb-1">実働時間</div>
              <div className="font-bold text-gray-900">{fmtMin(summary?.totalWorkMinutes)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-gray-500 mb-1">残業時間</div>
              <div className="font-bold text-orange-600">{fmtMin(summary?.totalOvertimeMinutes)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-gray-500 mb-1">深夜時間</div>
              <div className="font-bold text-purple-600">{fmtMin(summary?.totalLateNightMinutes)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-gray-500 mb-1">有給取得</div>
              <div className="font-bold text-green-600">{summary?.totalPaidLeaveDays || 0}日</div>
            </div>
          </div>

          {/* 日別打刻一覧 */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">日別勤務記録</h2>
            <div className="space-y-2">
              {records.length === 0 && <p className="text-sm text-gray-400 text-center py-4">打刻記録がありません</p>}
              {records.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                  <div className="text-gray-700">{r.work_date}</div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>出 {r.clock_in ? new Date(r.clock_in).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                    <span>退 {r.clock_out ? new Date(r.clock_out).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                  </div>
                  <div className="font-medium text-gray-900">{fmtMin(r.work_minutes)}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">※ 表示金額は概算です。控除前の総支給額です。</p>
        </>
      )}
    </div>
  )
}
