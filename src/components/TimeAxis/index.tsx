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
            <View className='time-row__overlap'>
              <View className='time-row__overlap-tag'>
                <Text className='time-row__overlap-text'>时间冲突</Text>
              </View>
              <View className='time-row__overlap-cards'>
                {row.blocks.map((block, i) => (
                  <View
                    key={`${block.startTime}-${i}`}
                    className='time-row__overlap-card'
                    onClick={(e) => { e.stopPropagation(); onBlockTap(block) }}
                  >
                    <BlockCard block={block} compact />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
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
