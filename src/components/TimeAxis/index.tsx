import { View, Text } from '@tarojs/components'
import { TimeBlock, TimeRow } from '@/types'
import './index.scss'

const UNIT_HEIGHT = 160 // px per block (1 unit = 1 card height)

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

interface TimeAxisProps {
  date: string
  rows: TimeRow[]
  onBlockTap: (block: TimeBlock) => void
}

export default function TimeAxis({ date, rows, onBlockTap }: TimeAxisProps) {
  if (rows.length === 0) {
    return (
      <View className='time-axis time-axis--empty'>
        <Text className='time-axis__empty-text'>暂无时段数据</Text>
      </View>
    )
  }

  return (
    <View className='time-axis'>
      {rows.map((row, index) => {
        const prevRow = index > 0 ? rows[index - 1] : null
        const hideStartTime = false
        return (
          <View
            key={`${date}-${row.startTime}-${index}`}
            style={{ animationDelay: `${index * 50}ms` }}
            className='time-row-wrap'
          >
            {row.type === 'single' ? (
              <SingleRow row={row} onBlockTap={onBlockTap} hideStartTime={!!hideStartTime} />
            ) : (
              <OverlapRow row={row} onBlockTap={onBlockTap} />
            )}
          </View>
        )
      })}
    </View>
  )
}

function SingleRow({ row, onBlockTap, hideStartTime }: { row: TimeRow; onBlockTap: (b: TimeBlock) => void; hideStartTime?: boolean }) {
  const block = row.blocks[0]
  return (
    <View className='time-row' onClick={() => onBlockTap(block)}>
      <View className='time-row__time'>
        {!hideStartTime && <Text className='time-row__time-start'>{row.startTime}</Text>}
      </View>
      <View className='time-row__content'>
        <BlockCard block={block} />
      </View>
    </View>
  )
}

function OverlapRow({ row, onBlockTap }: { row: TimeRow; onBlockTap: (b: TimeBlock) => void }) {
  // Calculate overlap boundaries
  const overlapStart = row.blocks.reduce((max, b) => b.startTime > max ? b.startTime : max, '00:00')
  const overlapEnd = row.blocks.reduce((min, b) => b.endTime < min ? b.endTime : min, '99:99')

  // Sort blocks by start time
  const sorted = [...row.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const n = sorted.length

  // Equal height layout: each card = 1 unit, overlap offset = 0.5 unit
  // For 2 cards: total = 1.5 units (card1: 0-1, card2: 0.5-1.5)
  // For 3 cards: total = 2 units (card1: 0-1, card2: 0.5-1.5, card3: 1-2)
  const overlapOffset = 0.5
  const totalUnits = 1 + (n - 1) * overlapOffset
  const containerHeight = totalUnits * UNIT_HEIGHT
  const blockHeight = UNIT_HEIGHT

  // Time labels at card boundaries
  // Don't include the group's end time — the next row will show it
  const timeLabels: { time: string; topPx: number; isDanger: boolean }[] = []
  sorted.forEach((block, i) => {
    const topPx = i * overlapOffset * UNIT_HEIGHT
    const bottomPx = topPx + blockHeight

    if (!timeLabels.find(l => l.time === block.startTime)) {
      const isDanger = block.startTime === overlapStart || block.startTime === overlapEnd
      timeLabels.push({ time: block.startTime, topPx, isDanger })
    }
    // Only show end time if it's a conflict boundary AND not the group's final end
    if (block.endTime !== row.endTime && !timeLabels.find(l => l.time === block.endTime)) {
      const isDanger = block.endTime === overlapStart || block.endTime === overlapEnd
      timeLabels.push({ time: block.endTime, topPx: bottomPx, isDanger })
    }
  })

  return (
    <View className='time-row'>
      {/* Left: time labels */}
      <View className='time-row__time time-row__time--overlap' style={{ height: `${containerHeight}px` }}>
        {timeLabels.map(label => (
          <Text
            key={label.time}
            className={`time-row__time-abs ${label.isDanger ? 'time-row__time-abs--danger' : ''}`}
            style={{ top: `${label.topPx}px` }}
          >
            {label.time}
          </Text>
        ))}
      </View>

      {/* Right: cards, each same height, staggered by 1 unit */}
      <View className='time-row__overlap-area' style={{ height: `${containerHeight}px` }}>
        {sorted.map((block, i) => {
          const top = i * overlapOffset * UNIT_HEIGHT
          const colWidth = 100 / n
          const left = i * colWidth

          return (
            <View
              key={`${block.startTime}-${i}`}
              className='time-row__overlap-card'
              style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${blockHeight}px`,
                left: `${left}%`,
                width: `${colWidth - 1}%`,
              }}
              onClick={(e) => { e.stopPropagation(); onBlockTap(block) }}
            >
              <BlockCard block={block} compact />
            </View>
          )
        })}
      </View>
    </View>
  )
}

function BlockCard({ block, compact }: { block: TimeBlock; compact?: boolean }) {
  if (block.status === 'available') {
    return (
      <View className='block-card block-card--available'>
        <Text className='block-card__label'>可预约</Text>
        {!compact && <Text className='block-card__arrow'>+</Text>}
      </View>
    )
  }

  if (block.status === 'booked' && block.booking) {
    return (
      <View className='block-card block-card--booked'>
        <Text className='block-card__service'>{block.booking.service_name}</Text>
        <Text className='block-card__customer'>{block.booking.customer_name}</Text>
        {!compact && (
          <Text className='block-card__time-range'>
            {block.startTime} - {block.endTime}
          </Text>
        )}
        <View className={`block-card__badge block-card__badge--${block.booking.status}`}>
          <Text className='block-card__badge-text'>
            {block.booking.status === 'confirmed' ? '已确认' : '待确认'}
          </Text>
        </View>
      </View>
    )
  }

  if (block.status === 'blocked') {
    return (
      <View className='block-card block-card--blocked'>
        <Text className='block-card__label block-card__label--blocked'>已屏蔽</Text>
        {block.blocked?.reason && (
          <Text className='block-card__reason'>{block.blocked.reason}</Text>
        )}
      </View>
    )
  }

  return null
}
