import { useState, useEffect, useCallback } from 'react'
import { Settings, TimeBlock, BlockedSlot, Booking } from '@/types'
import { generateTimeSlots, addMinutes, isTimeOverlap } from '@/utils/time'
import { getCollection } from '@/utils/cloud'

interface DaySlotsResult {
  blocks: TimeBlock[]
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

  const blocks = buildBlocks(settings, bookings, blockedSlots)

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

  return { blocks, loading, blockSlot, unblockSlot, refresh: fetchDayData }
}

function buildBlocks(
  settings: Settings | null,
  bookings: Booking[],
  blockedSlots: BlockedSlot[]
): TimeBlock[] {
  if (!settings) return []

  const { business_hours, time_slot_interval } = settings
  const times = generateTimeSlots(
    business_hours.start,
    business_hours.end,
    time_slot_interval
  )

  // Build individual slots first
  const slots = times.map(time => {
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

  // Merge consecutive same-status slots into blocks
  const blocks: TimeBlock[] = []
  let i = 0

  while (i < slots.length) {
    const current = slots[i]

    if (current.status === 'available') {
      // Merge consecutive available slots
      let end = i
      while (end + 1 < slots.length && slots[end + 1].status === 'available') {
        end++
      }
      blocks.push({
        startTime: current.time,
        endTime: slots[end].endTime,
        status: 'available',
      })
      i = end + 1
    } else if (current.status === 'booked' && current.booking) {
      // Use the booking's actual time range, skip all slots covered by this booking
      const booking = current.booking
      blocks.push({
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: 'booked',
        booking,
      })
      // Skip all slots that overlap with this booking
      while (i < slots.length && slots[i].booking?._id === booking._id) {
        i++
      }
    } else if (current.status === 'blocked' && current.blocked) {
      // Merge consecutive slots with same blocked entry
      const blocked = current.blocked
      let end = i
      while (end + 1 < slots.length && slots[end + 1].blocked?._id === blocked._id) {
        end++
      }
      blocks.push({
        startTime: blocked.start_time,
        endTime: blocked.end_time,
        status: 'blocked',
        blocked,
      })
      i = end + 1
    } else {
      i++
    }
  }

  return blocks
}
