-- =============================================
-- 勤怠アプリ用テーブル追加
-- 既存の employees テーブルと共有するSupabaseに追加
-- =============================================

-- 従業員の雇用形態・時給情報を追加（employeesテーブルに列追加）
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'monthly' CHECK (employment_type IN ('monthly', 'hourly')),
  ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS work_hours_per_day NUMERIC(4,2) DEFAULT 8.0,
  ADD COLUMN IF NOT EXISTS login_email TEXT,
  ADD COLUMN IF NOT EXISTS login_pin TEXT; -- ハッシュ化したPIN（4〜6桁）

-- 打刻記録
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,        -- 休憩時間（分）
  work_date DATE NOT NULL,                -- 勤務日
  note TEXT,
  overtime_minutes INTEGER DEFAULT 0,     -- 残業時間（分）自動計算
  late_night_minutes INTEGER DEFAULT 0,   -- 深夜時間（分）自動計算
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'holiday', 'paid_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- シフト希望申請
CREATE TABLE IF NOT EXISTS shift_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,             -- 希望日
  request_type TEXT NOT NULL CHECK (request_type IN ('work', 'holiday', 'paid_leave', 'half_day')),
  preferred_start TIME,                   -- 希望出勤時刻
  preferred_end TIME,                     -- 希望退勤時刻
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 月次給与サマリ（勤怠から自動集計）
CREATE TABLE IF NOT EXISTS monthly_attendance_summary (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,               -- 例: '2026-06'
  total_work_minutes INTEGER DEFAULT 0,
  total_overtime_minutes INTEGER DEFAULT 0,
  total_late_night_minutes INTEGER DEFAULT 0,
  total_paid_leave_days INTEGER DEFAULT 0,
  base_pay INTEGER DEFAULT 0,
  overtime_pay INTEGER DEFAULT 0,
  late_night_pay INTEGER DEFAULT 0,
  total_pay INTEGER DEFAULT 0,
  is_finalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, year_month)
);

-- RLS無効（内部ツール用）
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE shift_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_attendance_summary DISABLE ROW LEVEL SECURITY;
