'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emp = localStorage.getItem('kintai_employee')
    if (emp) router.replace('/clock')
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_number: employeeNumber, pin }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      localStorage.setItem('kintai_employee', JSON.stringify(data.employee))
      router.push('/clock')
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🕐</div>
          <h1 className="text-2xl font-bold text-gray-900">勤怠管理</h1>
          <p className="text-sm text-gray-500 mt-1">従業員番号とPINでログイン</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="label">従業員番号</label>
              <input
                className="input text-lg"
                value={employeeNumber}
                onChange={e => setEmployeeNumber(e.target.value)}
                placeholder="例: EMP001"
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label">PIN（4〜6桁）</label>
              <input
                className="input text-lg tracking-widest"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <a href="/admin/login" className="text-xs text-gray-400 hover:text-gray-600">管理者ページへ →</a>
        </div>
      </div>
    </div>
  )
}
