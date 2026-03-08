export function generateTimeSlots(
  startTime: string,
  endTime: string,
  interval: number
): string[] {
  const slots: string[] = []
  let [hours, minutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  const endTotal = endHours * 60 + endMinutes

  while (hours * 60 + minutes < endTotal) {
    slots.push(formatTime(hours, minutes))
    minutes += interval
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60)
      minutes = minutes % 60
    }
  }

  return slots
}

export function addMinutes(time: string, minutes: number): string {
  let [h, m] = time.split(':').map(Number)
  m += minutes
  if (m >= 60) {
    h += Math.floor(m / 60)
    m = m % 60
  }
  return formatTime(h, m)
}

export function isTimeInRange(time: string, start: string, end: string): boolean {
  return time >= start && time < end
}

export function isTimeOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  return start1 < end2 && start2 < end1
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatMonth(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date())
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
