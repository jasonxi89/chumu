import { View, Text } from '@tarojs/components'
import { TimeBlock, TimeRow } from '@/types'
import './index.scss'

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
          className='time-row'
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Time label */}
          <View className='time-row__time'>
            <Text className='time-row__time-start'>{row.startTime}</Text>
            <Text className='time-row__time-end'>{row.endTime}</Text>
          </View>

          {/* Content area */}
          {row.type === 'single' ? (
            <View className='time-row__content' onClick={() => onBlockTap(row.blocks[0])}>
              <BlockCard block={row.blocks[0]} />
            </View>
          ) : (
            <OverlapGroup row={row} onBlockTap={onBlockTap} />
          )}
        </View>
      ))}
    </View>
  )
}

function OverlapGroup({ row, onBlockTap }: { row: TimeRow; onBlockTap: (b: TimeBlock) => void }) {
  // Find overlap boundaries
  const overlapStart = row.blocks.reduce((max, b) => b.startTime > max ? b.startTime : max, '00:00')
  const overlapEnd = row.blocks.reduce((min, b) => b.endTime < min ? b.endTime : min, '99:99')

  const beforeBlocks = row.blocks.filter(b => b.startTime < overlapStart)
  const afterBlocks = row.blocks.filter(b => b.endTime > overlapEnd)

  return (
    <View className='time-row__overlap'>
      {/* Section 1: Before overlap — only the earlier-starting block */}
      {beforeBlocks.length > 0 && (
        <View className='overlap-section'>
          <View className='overlap-section__time'>
            <Text className='overlap-section__time-text'>
              {row.startTime}
            </Text>
          </View>
          <View className='overlap-section__cards'>
            {beforeBlocks.map((block, i) => (
              <View
                key={`before-${i}`}
                className='overlap-section__card overlap-section__card--half'
                onClick={(e) => { e.stopPropagation(); onBlockTap(block) }}
              >
                <BlockCard block={block} compact />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section 2: Overlap zone — side by side, red time labels */}
      <View className='overlap-section overlap-section--conflict'>
        <View className='overlap-section__time'>
          <Text className='overlap-section__time-text overlap-section__time-text--danger'>
            {overlapStart}
          </Text>
        </View>
        <View className='overlap-section__cards'>
          {row.blocks.map((block, i) => (
            <View
              key={`overlap-${i}`}
              className='overlap-section__card'
              onClick={(e) => { e.stopPropagation(); onBlockTap(block) }}
            >
              <BlockCard block={block} compact />
            </View>
          ))}
        </View>
      </View>

      {/* Section 3: After overlap — only the later-ending block */}
      {afterBlocks.length > 0 && (
        <View className='overlap-section'>
          <View className='overlap-section__time'>
            <Text className='overlap-section__time-text overlap-section__time-text--danger'>
              {overlapEnd}
            </Text>
          </View>
          <View className='overlap-section__cards'>
            {afterBlocks.map((block, i) => (
              <View
                key={`after-${i}`}
                className='overlap-section__card overlap-section__card--half-right'
                onClick={(e) => { e.stopPropagation(); onBlockTap(block) }}
              >
                <BlockCard block={block} compact />
              </View>
            ))}
          </View>
        </View>
      )}
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
