// =============================================
// 給与・残業・深夜割増計算ロジック
// =============================================

const OVERTIME_RATE    = 1.25  // 残業割増
const LATE_NIGHT_RATE  = 1.25  // 深夜割増（22:00〜5:00）
const LATE_NIGHT_START = 22    // 深夜開始時刻
const LATE_NIGHT_END   = 5     // 深夜終了時刻

/**
 * 2つの時刻の間の深夜時間（分）を計算
 */
export function calcLateNightMinutes(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0

  const start = new Date(clockIn)
  const end   = new Date(clockOut)
  let lateMinutes = 0

  // 1分刻みで深夜かどうかチェック（簡易実装）
  const cur = new Date(start)
  while (cur < end) {
    const h = cur.getHours()
    if (h >= LATE_NIGHT_START || h < LATE_NIGHT_END) {
      lateMinutes++
    }
    cur.setMinutes(cur.getMinutes() + 1)
  }
  return lateMinutes
}

/**
 * 実働分数から残業・深夜を分離して給与計算
 * @param {Object} employee - 従業員情報
 * @param {number} workMinutes - 実働分数（休憩除く）
 * @param {number} lateNightMinutes - そのうち深夜の分数
 * @returns {{ basePay, overtimePay, lateNightPay, totalPay }}
 */
export function calcDailyPay(employee, workMinutes, lateNightMinutes = 0) {
  const standardMinutes = (employee.work_hours_per_day || 8) * 60

  let basePay = 0
  let overtimePay = 0
  let lateNightPay = 0

  if (employee.employment_type === 'hourly') {
    const rate = employee.hourly_rate || 0
    const ratePerMin = rate / 60

    const overtimeMinutes = Math.max(0, workMinutes - standardMinutes)
    const normalMinutes   = workMinutes - overtimeMinutes

    // 通常時間分
    basePay = Math.floor(normalMinutes * ratePerMin)

    // 残業割増分（差額のみ）
    overtimePay = Math.floor(overtimeMinutes * ratePerMin * (OVERTIME_RATE - 1))

    // 深夜割増分（差額のみ）
    lateNightPay = Math.floor(lateNightMinutes * ratePerMin * (LATE_NIGHT_RATE - 1))

  } else {
    // 月給制：1日の時間単価を計算（月20営業日・所定労働時間で割る）
    const monthlyDays = 20
    const dailyRate = (employee.base_salary || 0) / monthlyDays
    const ratePerMin = dailyRate / ((employee.work_hours_per_day || 8) * 60)

    const overtimeMinutes = Math.max(0, workMinutes - standardMinutes)

    basePay      = Math.floor(employee.base_salary / monthlyDays) // 1日分の月給
    overtimePay  = Math.floor(overtimeMinutes * ratePerMin * OVERTIME_RATE)
    lateNightPay = Math.floor(lateNightMinutes * ratePerMin * (LATE_NIGHT_RATE - 1))
  }

  return {
    basePay,
    overtimePay,
    lateNightPay,
    totalPay: basePay + overtimePay + lateNightPay,
  }
}

/**
 * 月次サマリ計算
 */
export function calcMonthlySummary(employee, records) {
  let totalWorkMinutes     = 0
  let totalOvertimeMinutes = 0
  let totalLateNightMinutes = 0
  let totalPaidLeaveDays   = 0
  let totalBasePay         = 0
  let totalOvertimePay     = 0
  let totalLateNightPay    = 0

  for (const rec of records) {
    if (rec.status === 'paid_leave') {
      totalPaidLeaveDays++
      if (employee.employment_type === 'monthly') {
        totalBasePay += Math.floor((employee.base_salary || 0) / 20)
      }
      continue
    }
    if (!rec.clock_in || !rec.clock_out) continue

    const workMin = rec.work_minutes || 0
    const lnMin   = rec.late_night_minutes || 0
    const otMin   = Math.max(0, workMin - (employee.work_hours_per_day || 8) * 60)

    totalWorkMinutes      += workMin
    totalOvertimeMinutes  += otMin
    totalLateNightMinutes += lnMin

    const pay = calcDailyPay(employee, workMin, lnMin)
    totalBasePay      += pay.basePay
    totalOvertimePay  += pay.overtimePay
    totalLateNightPay += pay.lateNightPay
  }

  // 月給制は基本給を固定にする
  if (employee.employment_type === 'monthly') {
    totalBasePay = employee.base_salary || 0
  }

  return {
    totalWorkMinutes,
    totalOvertimeMinutes,
    totalLateNightMinutes,
    totalPaidLeaveDays,
    basePay:      totalBasePay,
    overtimePay:  totalOvertimePay,
    lateNightPay: totalLateNightPay,
    totalPay:     totalBasePay + totalOvertimePay + totalLateNightPay,
  }
}

export function fmtMin(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}時間${m > 0 ? m + '分' : ''}`
}
