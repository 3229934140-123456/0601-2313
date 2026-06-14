const PAD = (n: number) => String(n).padStart(2, '0')

export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: PAD(d.getMonth() + 1),
    DD: PAD(d.getDate()),
    HH: PAD(d.getHours()),
    mm: PAD(d.getMinutes()),
    ss: PAD(d.getSeconds()),
  }
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => map[m])
}

export function getWeekDates(baseDate: Date = new Date()): Date[] {
  const dates: Date[] = []
  const start = new Date(baseDate)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function getMonthDates(year: number, month: number): (Date | null)[] {
  const result: (Date | null)[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  for (let i = 0; i < startPadding; i++) result.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) {
    result.push(new Date(year, month, i))
  }
  return result
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date())
}

export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function subDays(date: Date | string, days: number): Date {
  return addDays(date, -days)
}
