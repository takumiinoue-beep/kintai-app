import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PIN認証（従業員番号 + PIN）
export async function POST(req) {
  const { employee_number, pin } = await req.json()

  if (!employee_number || !pin) {
    return NextResponse.json({ error: '従業員番号とPINを入力してください' }, { status: 400 })
  }

  const { data: emp, error } = await supabase
    .from('employees')
    .select('id, name, employee_number, login_pin, employment_type, base_salary, hourly_rate, work_hours_per_day, department, position')
    .eq('employee_number', employee_number)
    .single()

  if (error || !emp) {
    return NextResponse.json({ error: '従業員番号が見つかりません' }, { status: 401 })
  }

  if (!emp.login_pin) {
    return NextResponse.json({ error: 'PINが未設定です。管理者に連絡してください' }, { status: 401 })
  }

  if (emp.login_pin !== pin) {
    return NextResponse.json({ error: 'PINが正しくありません' }, { status: 401 })
  }

  // セッション用に必要情報を返す（実際の認証はlocalStorageで保持）
  const { login_pin, ...safeEmp } = emp
  return NextResponse.json({ employee: safeEmp })
}
