import { NextResponse } from 'next/server'

export async function POST(req) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD || 'takumiNo.123'
  if (password !== correct) {
    return NextResponse.json({ error: 'パスワードが正しくありません' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
