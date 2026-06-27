'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      localStorage.setItem('kintai_admin', '1')
      router.push('/admin')
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6fb' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="10" y="22" width="28" height="20" rx="4" stroke="#1a3328" strokeWidth="2"/><path d="M16 22v-6a8 8 0 0116 0v6" stroke="#1a3328" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="32" r="2.5" fill="#1a3328"/></svg></div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>管理者ログイン</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>勤怠管理システム</p>
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, padding: '10px 14px', fontSize: 14 }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>管理者パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                autoFocus
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: '#16a34a', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ fontSize: 12, color: '#9ca3af' }}>← 従業員ログインへ</a>
        </div>
      </div>
    </div>
  )
}
