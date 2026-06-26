import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, employee_number, department, position, employment_type, hourly_rate, base_salary, work_hours_per_day, login_pin')
    .order('employee_number')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { id, ...rest } = body
  if (id) {
    const { error } = await supabase.from('employees').update(rest).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
