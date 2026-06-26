'use client'
import Link from 'next/link'

export default function AdminTop() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">管理者ページ</h1>
          <p className="text-sm text-gray-500 mt-1">勤怠管理システム</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { href: '/admin/attendance', icon: '🕐', label: '打刻管理', desc: '全員の打刻確認・修正' },
            { href: '/admin/shift',      icon: '📅', label: 'シフト申請管理', desc: '希望の承認・却下' },
            { href: '/admin/summary',    icon: '💴', label: '月次集計', desc: '給与計算・勤務サマリ' },
            { href: '/admin/employees',  icon: '👥', label: '従業員設定', desc: 'PIN・時給・雇用形態' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="card hover:shadow-md transition-shadow cursor-pointer block">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← 従業員ログインページへ</a>
        </div>
      </div>
    </div>
  )
}
