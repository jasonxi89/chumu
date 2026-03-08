import { useState, useEffect, useCallback } from 'react'
import { Settings, TimeBlock, TimeRow, BlockedSlot, Booking } from '@/types'
import { isTimeOverlap } from '@/utils/time'
import { getCollection } from '@/utils/cloud'

interface DaySlotsResult {
  rows: TimeRow[]
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

  const rows = buildRows(settings, bookings, blockedSlots)

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

  return { rows, loading, blockSlot, unblockSlot, refresh: fetchDayData }
}

function buildRows(
  settings: Settings | null,
  bookings: Booking[],
  blockedSlots: BlockedSlot[]
): TimeRow[] {
  if (!settings) return []

  const { business_hours } = settings
  const dayStart = business_hours.start
  const dayEnd = business_hours.end

  // Build occupied blocks
  const occupied: TimeBlock[] = []

  for (const booking of bookings) {
    occupied.push({
      startTime: clampTime(booking.start_time, dayStart, dayEnd),
      endTime: clampTime(booking.end_time, dayStart, dayEnd),
      status: 'booked',
      booking,
    })
  }

  for (const blocked of blockedSlots) {
    occupied.push({
      startTime: clampTime(blocked.start_time, dayStart, dayEnd),
      endTime: clampTime(blocked.end_time, dayStart, dayEnd),
      status: 'blocked',
      blocked,
    })
  }

  occupied.sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Group overlapping blocks
  const groups: TimeBlock[][] = []
  for (const block of occupied) {
    let placed = false
    for (const group of groups) {
      if (group.some(b => isTimeOverlap(b.startTime, b.endTime, block.startTime, block.endTime))) {
        group.push(block)
        placed = true
        break
      }
    }
    if (!placed) {
      groups.push([block])
    }
  }

  // Convert groups to time rows + fill gaps with available
  const rows: TimeRow[] = []
  let cursor = dayStart

  // Sort groups by earliest start time
  groups.sort((a, b) => {
    const aStart = a.reduce((min, bl) => bl.startTime < min ? bl.startTime : min, '99:99')
    const bStart = b.reduce((min, bl) => bl.startTime < min ? bl.startTime : min, '99:99')
    return aStart.localeCompare(bStart)
  })

  for (const group of groups) {
    const groupStart = group.reduce((min, b) => b.startTime < min ? b.startTime : min, '99:99')
    const groupEnd = group.reduce((max, b) => b.endTime > max ? b.endTime : max, '00:00')

    // Fill gap before this group
    if (groupStart > cursor) {
      rows.push({
        type: 'single',
        startTime: cursor,
        endTime: groupStart,
        blocks: [{ startTime: cursor, endTime: groupStart, status: 'available' }],
      })
    }

    if (group.length === 1) {
      rows.push({
        type: 'single',
        startTime: groupStart,
        endTime: groupEnd,
        blocks: group,
      })
    } else {
      rows.push({
        type: 'overlap',
        startTime: groupStart,
        endTime: groupEnd,
        blocks: group,
      })
    }

    if (groupEnd > cursor) {
      cursor = groupEnd
    }
  }

  // Fill remaining
  if (cursor < dayEnd) {
    rows.push({
      type: 'single',
      startTime: cursor,
      endTime: dayEnd,
      blocks: [{ startTime: cursor, endTime: dayEnd, status: 'available' }],
    })
  }

  return rows
}

function clampTime(time: string, min: string, max: string): string {
  if (time < min) return min
  if (time > max) return max
  return time
}
