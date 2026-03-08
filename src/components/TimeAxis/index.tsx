import { View, Text } from '@tarojs/components'
import { TimeBlock, TimeRow } from '@/types'
import './index.scss'

interface TimeAxisProps {
  date: string
  rows: TimeRow[]
  onBlockTap: (block: TimeBlock) => void
  dayStart?: string
  dayEnd?: string
}

const HOUR_HEIGHT = 120 // px per hour

export default function TimeAxis({
  date, rows, onBlockTap, dayStart = '09:00', dayEnd = '18:00',
}: TimeAxisProps) {
  const startMinutes = timeToMinutes(dayStart)
  const endMinutes = timeToMinutes(dayEnd)
  const totalMinutes = endMinutes - startMinutes
  const totalHeight = (totalMinutes / 60) * HOUR_HEIGHT

  // Collect all blocks from all rows
  const allBlocks = rows.flatMap(r => r.blocks)
  const occupiedBlocks = allBlocks.filter(b => b.status !== 'available')

  // Assign columns for overlapping blocks (Google Calendar algorithm)
  const positioned = assignColumns(occupiedBlocks)

  // Generate hour labels
  const hours: string[] = []
  for (let m = startMinutes; m < endMinutes; m += 60) {
    hours.push(minutesToTime(m))
  }

  function getTop(time: string): number {
    const mins = timeToMinutes(time) - startMinutes
    return (mins / 60) * HOUR_HEIGHT
  }

  function getHeight(start: string, end: string): number {
    const duration = timeToMinutes(end) - timeToMinutes(start)
    return Math.max((duration / 60) * HOUR_HEIGHT, 40)
  }

  function handleEmptyTap(hourTime: string) {
    // Find the available block that covers this hour
    const availBlock = allBlocks.find(
      b => b.status === 'available' && b.startTime <= hourTime && b.endTime > hourTime
    )
    if (availBlock) onBlockTap(availBlock)
  }

  if (rows.length === 0) {
    return (
      <View className='time-grid time-grid--empty'>
        <Text className='time-grid__empty-text'>暂无时段数据</Text>
      </View>
    )
  }

  return (
    <View className='time-grid' style={{ height: `${totalHeight}px` }}>
      {/* Hour lines and labels */}
      {hours.map(hour => (
        <View
          key={hour}
          className='time-grid__hour'
          style={{ top: `${getTop(hour)}px` }}
          onClick={() => handleEmptyTap(hour)}
        >
          <Text className='time-grid__hour-label'>{hour}</Text>
          <View className='time-grid__hour-line' />
        </View>
      ))}

      {/* Event blocks */}
      {positioned.map((item, index) => {
        const block = item.block
        const top = getTop(block.startTime)
        const height = getHeight(block.startTime, block.endTime)
        const left = item.column * (100 / item.totalColumns)
        const width = 100 / item.totalColumns

        const isOverlap = item.totalColumns > 1
        const isBooked = block.status === 'booked'
        const isBlocked = block.status === 'blocked'

        return (
          <View
            key={`${date}-${block.startTime}-${index}`}
            className={`time-grid__event ${isBooked ? 'time-grid__event--booked' : ''} ${isBlocked ? 'time-grid__event--blocked' : ''} ${isOverlap ? 'time-grid__event--overlap' : ''}`}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left: `${90 + left * (750 - 90 - 20) / 100}px`,
              width: `${width * (750 - 90 - 20) / 100 - 6}px`,
            }}
            onClick={(e) => { e.stopPropagation(); onBlockTap(block) }}
          >
            {isBooked && block.booking && (
              <View className='time-grid__event-inner'>
                <Text className='time-grid__event-service'>
                  {block.booking.service_name}
                </Text>
                <Text className='time-grid__event-customer'>
                  {block.booking.customer_name}
                </Text>
                <Text className='time-grid__event-time'>
                  {block.startTime} - {block.endTime}
                </Text>
              </View>
            )}
            {isBlocked && (
              <View className='time-grid__event-inner'>
                <Text className='time-grid__event-blocked-label'>已屏蔽</Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ===== Time helpers =====
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ===== Google Calendar column assignment =====
interface PositionedBlock {
  block: TimeBlock
  column: number
  totalColumns: number
}

function assignColumns(blocks: TimeBlock[]): PositionedBlock[] {
  if (blocks.length === 0) return []

  const sorted = [...blocks].sort((a, b) => {
    if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime)
    return b.endTime.localeCompare(a.endTime)
  })

  // Assign columns greedily
  const columns: { endTime: string }[] = []
  const assignments: { block: TimeBlock; column: number }[] = []

  for (const block of sorted) {
    let placed = false
    for (let c = 0; c < columns.length; c++) {
      if (columns[c].endTime <= block.startTime) {
        columns[c].endTime = block.endTime
        assignments.push({ block, column: c })
        placed = true
        break
      }
    }
    if (!placed) {
      assignments.push({ block, column: columns.length })
      columns.push({ endTime: block.endTime })
    }
  }

  // Find overlap clusters and assign totalColumns per cluster
  const clusters = findClusters(sorted)
  const result: PositionedBlock[] = []

  for (const assignment of assignments) {
    const cluster = clusters.find(c => c.includes(assignment.block))
    const maxCol = cluster
      ? Math.max(...assignments.filter(a => cluster.includes(a.block)).map(a => a.column)) + 1
      : 1

    result.push({
      block: assignment.block,
      column: assignment.column,
      totalColumns: maxCol,
    })
  }

  return result
}

function findClusters(blocks: TimeBlock[]): TimeBlock[][] {
  const clusters: TimeBlock[][] = []

  for (const block of blocks) {
    let merged = false
    for (const cluster of clusters) {
      if (cluster.some(b =>
        timeToMinutes(b.startTime) < timeToMinutes(block.endTime) &&
        timeToMinutes(block.startTime) < timeToMinutes(b.endTime)
      )) {
        cluster.push(block)
        merged = true
        break
      }
    }
    if (!merged) {
      clusters.push([block])
    }
  }

  return clusters
}
