'use client'
import { useEffect, useState } from 'react'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadEmployees() }, [])

  async function loadEmployees() {
    const res = await fetch('/api/employees')
    setEmployees(await res.json())
  }

  function startEdit(emp) {
    setEditing({ ...emp, login_pin: emp.login_pin || '' })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (res.ok) {
        setMsg('保存しました')
        setEditing(null)
        loadEmployees()
        setTimeout(() => setMsg(''), 3000)
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">←</a>
        <h1 className="text-xl font-bold text-gray-900">従業員設定</h1>
      </div>

      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm mb-4">{msg}</div>}

      <div className="space-y-3">
        {employees.map(emp => (
          <div key={emp.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">{emp.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {emp.employee_number} / {emp.department || '部署未設定'}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${emp.employment_type === 'hourly' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {emp.employment_type === 'hourly' ? '時給制' : '月給制'}
                  </span>
                  {emp.employment_type === 'hourly'
                    ? <span className="text-gray-600">時給 ¥{(emp.hourly_rate || 0).toLocaleString()}</span>
                    : <span className="text-gray-600">月給 ¥{(emp.base_salary || 0).toLocaleString()}</span>
                  }
                  <span className={`px-2 py-0.5 rounded-full ${emp.login_pin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {emp.login_pin ? 'PIN設定済' : 'PIN未設定'}
                  </span>
                </div>
              </div>
              <button onClick={() => startEdit(emp)} className="btn-secondary text-xs">編集</button>
            </div>
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing.name} の設定</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">雇用形態</label>
                <select className="input" value={editing.employment_type || 'monthly'}
                  onChange={e => setEditing(f => ({ ...f, employment_type: e.target.value }))}>
                  <option value="monthly">月給制</option>
                  <option value="hourly">時給制</option>
                </select>
              </div>
              {editing.employment_type === 'hourly' ? (
                <div>
                  <label className="label">時給（円）</label>
                  <input type="number" className="input" value={editing.hourly_rate || 0}
                    onChange={e => setEditing(f => ({ ...f, hourly_rate: Number(e.target.value) }))} />
                </div>
              ) : (
                <div>
                  <label className="label">月給（円）</label>
                  <input type="number" className="input" value={editing.base_salary || 0}
                    onChange={e => setEditing(f => ({ ...f, base_salary: Number(e.target.value) }))} />
                </div>
              )}
              <div>
                <label className="label">所定労働時間（時間/日）</label>
                <input type="number" step="0.5" className="input" value={editing.work_hours_per_day || 8}
                  onChange={e => setEditing(f => ({ ...f, work_hours_per_day: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="label">ログインPIN（4〜6桁の数字）</label>
                <input type="text" inputMode="numeric" maxLength={6} className="input"
                  value={editing.login_pin || ''}
                  placeholder="例: 1234"
                  onChange={e => setEditing(f => ({ ...f, login_pin: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">従業員がログインに使うPINです</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">キャンセル</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? '保存中...' : '保存'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
