'use client'
import { useEffect, useState } from 'react'

function thisMonth() { return new Date().toISOString().slice(0, 7) }
function fmtTime(iso) { return iso ? new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--' }
function fmtMin(m) { if (!m) return '-'; return `${Math.floor(m/60)}h${m%60>0?m%60+'m':''}` }

export default function AdminAttendance() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [month, setMonth] = useState(thisMonth())
  const [selectedEmp, setSelectedEmp] = useState('all')

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(setEmployees)
  }, [])

  useEffect(() => { loadRecords() }, [month, selectedEmp])

  async function loadRecords() {
    const empId = selectedEmp !== 'all' ? selectedEmp : null
    const empList = empId ? [empId] : employees.map(e => e.id)
    const all = await Promise.all(
      (empId ? [empId] : employees.map(e => e.id)).map(id =>
        fetch(`/api/attendance?employee_id=${id}&month=${month}`).then(r => r.json()).then(recs =>
          (recs || []).map(r => ({ ...r, employee: employees.find(e => e.id === id) }))
        )
      )
    )
    setRecords(all.flat().sort((a, b) => b.work_date.localeCompare(a.work_date)))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">←</a>
        <h1 className="text-xl font-bold text-gray-900">打刻管理</h1>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="month" className="input w-auto" value={month} onChange={e => setMonth(e.target.value)} />
        <select className="input w-auto" value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
          <option value="all">全員</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">日付</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">従業員</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">出勤</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">退勤</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">実働</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">残業</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">打刻記録がありません</td></tr>
            )}
            {records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{r.work_date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.employee?.name || '-'}</td>
                <td className="px-4 py-3 text-center text-green-700 font-mono">{fmtTime(r.clock_in)}</td>
                <td className="px-4 py-3 text-center text-blue-700 font-mono">{fmtTime(r.clock_out)}</td>
                <td className="px-4 py-3 text-center font-medium">{fmtMin(r.work_minutes)}</td>
                <td className="px-4 py-3 text-center">
                  {r.overtime_minutes > 0
                    ? <span className="text-orange-600 font-medium">{fmtMin(r.overtime_minutes)}</span>
                    : <span className="text-gray-300">-</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
