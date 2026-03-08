import { useState, useEffect, useCallback } from 'react'
import { BlockedSlot, Booking } from '@/types'
import { getCollection } from '@/utils/cloud'

interface CalendarData {
  markedDates: Record<string, string[]>
  blockedSlots: BlockedSlot[]
  bookings: Booking[]
  loading: boolean
  refresh: () => void
}

const MOCK_BOOKINGS: Booking[] = [
  {
    date: formatTodayOffset(0),
    start_time: '10:00',
    end_time: '11:00',
    duration: 60,
    service_type: 'haircut',
    service_name: '精剪造型',
    customer_name: '李小姐',
    customer_phone: '138****8888',
    customer_wechat: 'lixiaojie',
    status: 'confirmed',
    openid: 'mock_001',
    created_at: new Date(),
  },
  {
    date: formatTodayOffset(1),
    start_time: '14:00',
    end_time: '15:30',
    duration: 90,
    service_type: 'color',
    service_name: '染发套餐',
    customer_name: '王先生',
    customer_phone: '139****6666',
    customer_wechat: 'wangxs',
    status: 'pending',
    openid: 'mock_002',
    created_at: new Date(),
  },
]

const MOCK_BLOCKED: BlockedSlot[] = [
  {
    date: formatTodayOffset(0),
    start_time: '12:00',
    end_time: '13:00',
    reason: '午休',
    created_at: new Date(),
  },
  {
    date: formatTodayOffset(2),
    start_time: '09:00',
    end_time: '10:00',
    reason: '私人事务',
    created_at: new Date(),
  },
]

function formatTodayOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildMarkedDates(
  bookings: Booking[],
  blockedSlots: BlockedSlot[]
): Record<string, string[]> {
  const marks: Record<string, string[]> = {}

  for (const booking of bookings) {
    if (!marks[booking.date]) marks[booking.date] = []
    const color = booking.status === 'confirmed' ? '#34d399' : '#fb923c'
    if (marks[booking.date].length < 3) {
      marks[booking.date].push(color)
    }
  }

  for (const slot of blockedSlots) {
    if (!marks[slot.date]) marks[slot.date] = []
    if (marks[slot.date].length < 3) {
      marks[slot.date].push('#f87171')
    }
  }

  return marks
}

export function useCalendarData(year: number, month: number): CalendarData {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const nextMonth = month === 11
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 2).padStart(2, '0')}-01`

    try {
      const [bookingRes, blockedRes] = await Promise.all([
        getCollection('bookings')
          .where({ date: { $gte: monthStart, $lt: nextMonth } } as any)
          .get(),
        getCollection('blocked_slots')
          .where({ date: { $gte: monthStart, $lt: nextMonth } } as any)
          .get(),
      ])
      setBookings(bookingRes.data as unknown as Booking[])
      setBlockedSlots(blockedRes.data as unknown as BlockedSlot[])
    } catch {
      console.warn('Cloud DB not available, using mock data')
      setBookings(MOCK_BOOKINGS.filter(b => {
        const d = new Date(b.date)
        return d.getFullYear() === year && d.getMonth() === month
      }))
      setBlockedSlots(MOCK_BLOCKED.filter(s => {
        const d = new Date(s.date)
        return d.getFullYear() === year && d.getMonth() === month
      }))
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const markedDates = buildMarkedDates(bookings, blockedSlots)

  return { markedDates, blockedSlots, bookings, loading, refresh: fetchData }
}
