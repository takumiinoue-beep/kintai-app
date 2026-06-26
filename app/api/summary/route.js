import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { calcMonthlySummary } from '@/lib/payCalc'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')
  const month = searchParams.get('month') // YYYY-MM

  // 従業員情報取得
  const { data: emp } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single()

  if (!emp) return NextResponse.json({ error: '従業員が見つかりません' }, { status: 404 })

  // 月次打刻レコード取得
  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('work_date', `${month}-01`)
    .lte('work_date', `${month}-31`)
    .order('work_date')

  const summary = calcMonthlySummary(emp, records || [])

  return NextResponse.json({
    employee: emp,
    month,
    records: records || [],
    summary,
  })
}
