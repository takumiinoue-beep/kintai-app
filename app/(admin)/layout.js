'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const path = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (path === '/admin/login') { setChecked(true); return }
    const isAdmin = localStorage.getItem('kintai_admin')
    if (!isAdmin) { router.replace('/admin/login'); return }
    setChecked(true)
  }, [path])

  if (!checked) return null

  if (path === '/admin/login') return <>{children}</>

  function handleLogout() {
    localStorage.removeItem('kintai_admin')
    router.push('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6fb', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>勤怠管理</span>
          <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 20 }}>管理者</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>ホーム</a>
          <button onClick={handleLogout} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
          }}>ログアウト</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
