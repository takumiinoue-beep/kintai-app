import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')
  const month = searchParams.get('month') // YYYY-MM
  const all = searchParams.get('all')     // 管理者用：全員分

  let query = supabase
    .from('shift_requests')
    .select('*, employees(name, department)')
    .order('request_date')

  if (month) {
    query = query
      .gte('request_date', `${month}-01`)
      .lte('request_date', `${month}-31`)
  }
  if (employeeId && !all) {
    query = query.eq('employee_id', employeeId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()

  // 管理者からの承認・却下
  if (body.action === 'approve' || body.action === 'reject') {
    const { id, action, admin_note } = body
    const { error } = await supabase
      .from('shift_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_note: admin_note || null,
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // 従業員からの申請
  const { employee_id, request_date, request_type, preferred_start, preferred_end, note } = body

  // 同日の申請が既にあれば更新
  const { data: existing } = await supabase
    .from('shift_requests')
    .select('id')
    .eq('employee_id', employee_id)
    .eq('request_date', request_date)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('shift_requests')
      .update({ request_type, preferred_start, preferred_end, note, status: 'pending' })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('shift_requests')
      .insert({ employee_id, request_date, request_type, preferred_start, preferred_end, note })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
