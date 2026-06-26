import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

function calcWorkMinutes(clockIn, clockOut, breakMinutes = 0) {
  if (!clockIn || !clockOut) return 0
  const diff = (new Date(clockOut) - new Date(clockIn)) / 60000
  return Math.max(0, Math.floor(diff) - breakMinutes)
}

function calcLateNightMinutes(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0
  const start = new Date(clockIn)
  const end = new Date(clockOut)
  let minutes = 0
  const cur = new Date(start)
  while (cur < end) {
    const h = cur.getHours()
    if (h >= 22 || h < 5) minutes++
    cur.setMinutes(cur.getMinutes() + 1)
  }
  return minutes
}

// 今日の打刻取得
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')
  const date = searchParams.get('date')
  const month = searchParams.get('month') // YYYY-MM

  if (month) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', `${month}-01`)
      .lte('work_date', `${month}-31`)
      .order('work_date')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('work_date', date || new Date().toISOString().slice(0, 10))
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data || null)
}

// 出勤・退勤・修正
export async function POST(req) {
  const body = await req.json()
  const { action, employee_id, break_minutes, note, work_date } = body
  const today = work_date || new Date().toISOString().slice(0, 10)
  const now = new Date().toISOString()

  // 今日のレコードを取得
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee_id)
    .eq('work_date', today)
    .single()

  if (action === 'clock_in') {
    if (existing?.clock_in) {
      return NextResponse.json({ error: '既に出勤済みです' }, { status: 400 })
    }
    if (existing) {
      const { error } = await supabase
        .from('attendance_records')
        .update({ clock_in: now, status: 'present' })
        .eq('id', existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('attendance_records')
        .insert({ employee_id, work_date: today, clock_in: now, status: 'present' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, action: 'clock_in', time: now })
  }

  if (action === 'clock_out') {
    if (!existing?.clock_in) {
      return NextResponse.json({ error: '出勤打刻がありません' }, { status: 400 })
    }
    if (existing?.clock_out) {
      return NextResponse.json({ error: '既に退勤済みです' }, { status: 400 })
    }
    const bm = break_minutes || existing.break_minutes || 0
    const workMin = calcWorkMinutes(existing.clock_in, now, bm)
    const lnMin = calcLateNightMinutes(existing.clock_in, now)
    const otMin = Math.max(0, workMin - (8 * 60))

    const { error } = await supabase
      .from('attendance_records')
      .update({
        clock_out: now,
        break_minutes: bm,
        work_minutes: workMin,
        late_night_minutes: lnMin,
        overtime_minutes: otMin,
        note: note || existing.note,
      })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'clock_out', time: now, work_minutes: workMin })
  }

  return NextResponse.json({ error: '不正なアクション' }, { status: 400 })
}
