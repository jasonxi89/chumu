import { View, Text } from '@tarojs/components'
import { TimeBlock, TimeRow } from '@/types'
import './index.scss'

const UNIT_HEIGHT = 140 // px per "unit" block height

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
      {rows.map((row, index) => (
        <View
          key={`${date}-${row.startTime}-${index}`}
          style={{ animationDelay: `${index * 50}ms` }}
          className='time-row-wrap'
        >
          {row.type === 'single' ? (
            <SingleRow row={row} onBlockTap={onBlockTap} />
          ) : (
            <OverlapRow row={row} onBlockTap={onBlockTap} />
          )}
        </View>
      ))}
    </View>
  )
}

function SingleRow({ row, onBlockTap }: { row: TimeRow; onBlockTap: (b: TimeBlock) => void }) {
  const block = row.blocks[0]
  return (
    <View className='time-row' onClick={() => onBlockTap(block)}>
      <View className='time-row__time'>
        <Text className='time-row__time-start'>{row.startTime}</Text>
        <Text className='time-row__time-end'>{row.endTime}</Text>
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

  // Equal height layout: each card = 2 units, overlap = 1 unit
  // For 2 cards: total = 3 units (card1: 0-2, card2: 1-3)
  // For 3 cards: total = 4 units (card1: 0-2, card2: 1-3, card3: 2-4)
  const totalUnits = n + 1
  const blockUnits = 2
  const containerHeight = totalUnits * UNIT_HEIGHT
  const blockHeight = blockUnits * UNIT_HEIGHT

  // Time labels at card boundaries
  const timeLabels: { time: string; topUnit: number; isDanger: boolean }[] = []
  sorted.forEach((block, i) => {
    const topUnit = i
    const bottomUnit = i + blockUnits

    if (!timeLabels.find(l => l.time === block.startTime)) {
      const isDanger = block.startTime === overlapStart || block.startTime === overlapEnd
      timeLabels.push({ time: block.startTime, topUnit, isDanger })
    }
    if (!timeLabels.find(l => l.time === block.endTime)) {
      const isDanger = block.endTime === overlapStart || block.endTime === overlapEnd
      timeLabels.push({ time: block.endTime, topUnit: bottomUnit, isDanger })
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
            style={{ top: `${label.topUnit * UNIT_HEIGHT}px` }}
          >
            {label.time}
          </Text>
        ))}
      </View>

      {/* Right: cards, each same height, staggered by 1 unit */}
      <View className='time-row__overlap-area' style={{ height: `${containerHeight}px` }}>
        {sorted.map((block, i) => {
          const top = i * UNIT_HEIGHT
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
