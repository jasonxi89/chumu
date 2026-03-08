import { useState, useEffect, useCallback } from 'react'
import { Settings, TimeSlot, BlockedSlot, Booking } from '@/types'
import { generateTimeSlots, addMinutes, isTimeOverlap } from '@/utils/time'
import { getCollection } from '@/utils/cloud'

interface DaySlotsResult {
  slots: TimeSlot[]
  loading: boolean
  blockSlot: (startTime: string, endTime: string, reason?: string) => Promise<void>
  unblockSlot: (slotId: string) => Promise<void>
  refresh: () => void
}

export function useDaySlots(
  date: string,
  settings: Settings | null,
  externalBookings?: Booking[],
  externalBlocked?: BlockedSlot[]
): DaySlotsResult {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDayData = useCallback(async () => {
    if (!date || !settings) return
    setLoading(true)

    if (externalBookings && externalBlocked) {
      setBookings(externalBookings.filter(b => b.date === date))
      setBlockedSlots(externalBlocked.filter(s => s.date === date))
      setLoading(false)
      return
    }

    try {
      const [bookingRes, blockedRes] = await Promise.all([
        getCollection('bookings').where({ date } as any).get(),
        getCollection('blocked_slots').where({ date } as any).get(),
      ])
      setBookings(bookingRes.data as unknown as Booking[])
      setBlockedSlots(blockedRes.data as unknown as BlockedSlot[])
    } catch {
      setBookings([])
      setBlockedSlots([])
    } finally {
      setLoading(false)
    }
  }, [date, settings, externalBookings, externalBlocked])

  useEffect(() => {
    fetchDayData()
  }, [fetchDayData])

  const slots = buildSlots(settings, bookings, blockedSlots)

  async function blockSlot(startTime: string, endTime: string, reason?: string) {
    const newBlocked: BlockedSlot = {
      date,
      start_time: startTime,
      end_time: endTime,
      reason,
      created_at: new Date(),
    }

    try {
      const res = await getCollection('blocked_slots').add({ data: newBlocked } as any)
      newBlocked._id = (res as any)._id
    } catch {
      newBlocked._id = `local_${Date.now()}`
    }

    setBlockedSlots(prev => [...prev, newBlocked])
  }

  async function unblockSlot(slotId: string) {
    try {
      await getCollection('blocked_slots').doc(slotId).remove({} as any)
    } catch {
      // local fallback
    }
    setBlockedSlots(prev => prev.filter(s => s._id !== slotId))
  }

  return { slots, loading, blockSlot, unblockSlot, refresh: fetchDayData }
}

function buildSlots(
  settings: Settings | null,
  bookings: Booking[],
  blockedSlots: BlockedSlot[]
): TimeSlot[] {
  if (!settings) return []

  const { business_hours, time_slot_interval } = settings
  const times = generateTimeSlots(
    business_hours.start,
    business_hours.end,
    time_slot_interval
  )

  return times.map(time => {
    const endTime = addMinutes(time, time_slot_interval)

    const matchedBlocked = blockedSlots.find(s =>
      isTimeOverlap(time, endTime, s.start_time, s.end_time)
    )
    if (matchedBlocked) {
      return { time, endTime, status: 'blocked' as const, blocked: matchedBlocked }
    }

    const matchedBooking = bookings.find(b =>
      isTimeOverlap(time, endTime, b.start_time, b.end_time)
    )
    if (matchedBooking) {
      return { time, endTime, status: 'booked' as const, booking: matchedBooking }
    }

    return { time, endTime, status: 'available' as const }
  })
}
