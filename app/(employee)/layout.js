'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function EmployeeLayout({ children }) {
  const router = useRouter()
  const path = usePathname()
  const [employee, setEmployee] = useState(null)

  useEffect(() => {
    const emp = localStorage.getItem('kintai_employee')
    if (!emp) { router.replace('/'); return }
    setEmployee(JSON.parse(emp))
  }, [])

  function handleLogout() {
    localStorage.removeItem('kintai_employee')
    router.push('/')
  }

  const nav = [
    { href: '/clock',    label: '打刻' },
    { href: '/schedule', label: 'シフト申請' },
    { href: '/mypage',   label: '給与確認' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <header style={{ background: '#2d6a4f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>勤怠管理</span>
          <nav style={{ display: 'flex', gap: 0 }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} style={{
                padding: '0 20px', height: 52, display: 'flex', alignItems: 'center',
                fontSize: 14, color: path === item.href ? 'white' : 'rgba(255,255,255,0.65)',
                borderBottom: path === item.href ? '3px solid white' : '3px solid transparent',
                textDecoration: 'none', fontWeight: path === item.href ? 600 : 400,
                transition: 'color 0.15s',
              }}>{item.label}</Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {employee && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {employee.name}
            </span>
          )}
          <button onClick={handleLogout} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
          }}>ログアウト</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 32px' }}>
        {children}
      </main>
    </div>
  )
}
