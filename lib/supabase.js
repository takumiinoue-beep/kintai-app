import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// サービスロールキーがあればRLSをバイパス、なければanonキーで動作
const activeKey = (serviceRoleKey && serviceRoleKey.startsWith('eyJ')) ? serviceRoleKey : supabaseAnonKey

export const supabase = createClient(supabaseUrl, activeKey, {
  auth: { persistSession: false }
})
