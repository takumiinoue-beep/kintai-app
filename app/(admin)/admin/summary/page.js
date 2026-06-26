'use client'
import { useEffect, useState } from 'react'

function thisMonth() { return new Date().toISOString().slice(0, 7) }
function fmt(n) { return '¥' + Math.round(n || 0).toLocaleString('ja-JP') }
function fmtMin(m) { if (!m) return '0h'; return `${Math.floor(m/60)}h${m%60>0?m%60+'m':''}` }

export default function AdminSummary() {
  const [employees, setEmployees] = useState([])
  const [summaries, setSummaries] = useState([])
  const [month, setMonth] = useState(thisMonth())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(setEmployees)
  }, [])

  useEffect(() => {
    if (employees.length) loadSummaries()
  }, [month, employees])

  async function loadSummaries() {
    setLoading(true)
    const results = await Promise.all(
      employees.map(emp =>
        fetch(`/api/summary?employee_id=${emp.id}&month=${month}`)
          .then(r => r.json())
          .then(data => ({ ...data, employee: emp }))
      )
    )
    setSummaries(results)
    setLoading(false)
  }

  const totalPay = summaries.reduce((s, r) => s + (r.summary?.totalPay || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">←</a>
        <h1 className="text-xl font-bold text-gray-900">月次集計・給与サマリ</h1>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <input type="month" className="input w-auto" value={month} onChange={e => setMonth(e.target.value)} />
        <div className="text-sm text-gray-600">
          人件費合計：<span className="font-bold text-indigo-700 text-base">{fmt(totalPay)}</span>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-10 text-gray-400">集計中...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">従業員</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">形態</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">実働</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">残業</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">基本給</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">残業手当</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">深夜割増</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-indigo-700">合計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.map(({ employee, summary }) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {employee.name}
                    <div className="text-xs text-gray-400">{employee.department}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${employee.employment_type === 'hourly' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {employee.employment_type === 'hourly' ? '時給' : '月給'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{fmtMin(summary?.totalWorkMinutes)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={summary?.totalOvertimeMinutes > 0 ? 'text-orange-600 font-medium' : 'text-gray-300'}>
                      {fmtMin(summary?.totalOvertimeMinutes)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(summary?.basePay)}</td>
                  <td className="px-4 py-3 text-right text-orange-600">{fmt(summary?.overtimePay)}</td>
                  <td className="px-4 py-3 text-right text-purple-600">{fmt(summary?.lateNightPay)}</td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-700">{fmt(summary?.totalPay)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td colSpan={7} className="px-4 py-3 font-bold text-gray-700 text-right">合計</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700 text-base">{fmt(totalPay)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
