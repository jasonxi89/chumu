import { useState, useEffect, useCallback } from 'react'
import { Settings, TimeBlock, BlockedSlot, Booking } from '@/types'
import { isTimeOverlap } from '@/utils/time'
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

  const { business_hours } = settings
  const dayStart = business_hours.start
  const dayEnd = business_hours.end

  // Build blocks directly from bookings and blocked slots
  const occupiedBlocks: TimeBlock[] = []

  // Add booking blocks
  for (const booking of bookings) {
    occupiedBlocks.push({
      startTime: clampTime(booking.start_time, dayStart, dayEnd),
      endTime: clampTime(booking.end_time, dayStart, dayEnd),
      status: 'booked',
      booking,
    })
  }

  // Add blocked slot blocks
  for (const blocked of blockedSlots) {
    occupiedBlocks.push({
      startTime: clampTime(blocked.start_time, dayStart, dayEnd),
      endTime: clampTime(blocked.end_time, dayStart, dayEnd),
      status: 'blocked',
      blocked,
    })
  }

  // Sort by start time
  occupiedBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Detect overlaps between booking blocks
  for (let i = 0; i < occupiedBlocks.length; i++) {
    for (let j = i + 1; j < occupiedBlocks.length; j++) {
      const a = occupiedBlocks[i]
      const b = occupiedBlocks[j]
      if (a.status === 'booked' && b.status === 'booked' &&
          isTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        a.hasOverlap = true
        a.overlapWith = b.booking?.service_name
        b.hasOverlap = true
        b.overlapWith = a.booking?.service_name
      }
    }
  }

  // Fill gaps with available blocks
  const allBlocks: TimeBlock[] = []
  let cursor = dayStart

  for (const block of occupiedBlocks) {
    if (block.startTime > cursor) {
      allBlocks.push({
        startTime: cursor,
        endTime: block.startTime,
        status: 'available',
      })
    }
    allBlocks.push(block)
    if (block.endTime > cursor) {
      cursor = block.endTime
    }
  }

  // Fill remaining time after last block
  if (cursor < dayEnd) {
    allBlocks.push({
      startTime: cursor,
      endTime: dayEnd,
      status: 'available',
    })
  }

  return allBlocks
}

function clampTime(time: string, min: string, max: string): string {
  if (time < min) return min
  if (time > max) return max
  return time
}
