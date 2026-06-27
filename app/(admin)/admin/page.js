'use client'
import Link from 'next/link'
import { Clock, Calendar, BarChart2, Users } from 'lucide-react'

const items = [
  { href: '/admin/attendance', icon: Clock,     label: '打刻管理',     desc: '全員の打刻確認・修正' },
  { href: '/admin/shift',      icon: Calendar,  label: 'シフト申請管理', desc: '希望の承認・却下' },
  { href: '/admin/summary',    icon: BarChart2, label: '月次集計',     desc: '給与計算・勤務サマリ' },
  { href: '/admin/employees',  icon: Users,     label: '従業員設定',   desc: 'PIN・時給・雇用形態' },
]

export default function AdminTop() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>管理者ページ</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>勤怠管理システム</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {items.map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
                padding: '24px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={20} color="#2d6a4f" strokeWidth={1.75} />
                </div>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{item.desc}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <a href="/" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>← 従業員ログインページへ</a>
      </div>
    </div>
  )
}
