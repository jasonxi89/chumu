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

  const groupStartMin = timeToMinutes(row.startTime)
  const groupEndMin = timeToMinutes(row.endTime)
  const groupDuration = groupEndMin - groupStartMin

  // Each block height = 2 units, overlap = 1 unit
  // Total container height: block1 unique + overlap + block2 unique
  // With 2 blocks: total = 2 + 2 - 1 = 3 units
  const totalUnits = row.blocks.length + 1
  const containerHeight = totalUnits * UNIT_HEIGHT

  // Collect all time boundaries for left column labels
  const timeLabels: { time: string; top: number; isDanger: boolean }[] = []

  // Sort blocks by start time
  const sorted = [...row.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime))

  sorted.forEach((block, i) => {
    const blockStartMin = timeToMinutes(block.startTime)
    const blockEndMin = timeToMinutes(block.endTime)
    const top = ((blockStartMin - groupStartMin) / groupDuration) * containerHeight
    const bottom = ((blockEndMin - groupStartMin) / groupDuration) * containerHeight

    // Start time label
    const isStartConflict = block.startTime === overlapStart || block.startTime === overlapEnd
    if (!timeLabels.find(l => l.time === block.startTime)) {
      timeLabels.push({ time: block.startTime, top, isDanger: isStartConflict })
    }

    // End time label
    const isEndConflict = block.endTime === overlapStart || block.endTime === overlapEnd
    if (!timeLabels.find(l => l.time === block.endTime)) {
      timeLabels.push({ time: block.endTime, top: bottom, isDanger: isEndConflict })
    }
  })

  return (
    <View className='time-row'>
      {/* Left: time labels absolutely positioned */}
      <View className='time-row__time time-row__time--overlap' style={{ height: `${containerHeight}px` }}>
        {timeLabels.map(label => (
          <Text
            key={label.time}
            className={`time-row__time-abs ${label.isDanger ? 'time-row__time-abs--danger' : ''}`}
            style={{ top: `${label.top}px` }}
          >
            {label.time}
          </Text>
        ))}
      </View>

      {/* Right: cards absolutely positioned */}
      <View className='time-row__overlap-area' style={{ height: `${containerHeight}px` }}>
        {sorted.map((block, i) => {
          const blockStartMin = timeToMinutes(block.startTime)
          const blockEndMin = timeToMinutes(block.endTime)
          const top = ((blockStartMin - groupStartMin) / groupDuration) * containerHeight
          const height = ((blockEndMin - blockStartMin) / groupDuration) * containerHeight
          const colWidth = 100 / row.blocks.length
          const left = i * colWidth

          return (
            <View
              key={`${block.startTime}-${i}`}
              className='time-row__overlap-card'
              style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${height}px`,
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
