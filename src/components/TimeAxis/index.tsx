import { View, Text } from '@tarojs/components'
import { TimeBlock } from '@/types'
import './index.scss'

interface TimeAxisProps {
  date: string
  blocks: TimeBlock[]
  onBlockTap: (block: TimeBlock) => void
}

export default function TimeAxis({ date, blocks, onBlockTap }: TimeAxisProps) {
  if (blocks.length === 0) {
    return (
      <View className='time-axis time-axis--empty'>
        <Text className='time-axis__empty-text'>暂无时段数据</Text>
      </View>
    )
  }

  return (
    <View className='time-axis'>
      {blocks.map((block, index) => (
        <View
          key={`${date}-${block.startTime}-${block.status}`}
          className={`time-block time-block--${block.status}${block.hasOverlap ? ' time-block--overlap' : ''}`}
          onClick={() => onBlockTap(block)}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <View className='time-block__time'>
            <Text className='time-block__time-text'>{block.startTime}</Text>
            <Text className='time-block__time-sep'>|</Text>
            <Text className='time-block__time-text'>{block.endTime}</Text>
          </View>

          <View className='time-block__content'>
            {block.status === 'available' && (
              <View className='time-block__inner'>
                <Text className='time-block__label'>可预约</Text>
                <Text className='time-block__arrow'>+</Text>
              </View>
            )}

            {block.status === 'booked' && block.booking && (
              <View className='time-block__inner'>
                {block.hasOverlap && (
                  <View className='time-block__overlap-tag'>
                    <Text className='time-block__overlap-text'>
                      时间冲突 · {block.overlapWith}
                    </Text>
                  </View>
                )}
                <Text className='time-block__service'>{block.booking.service_name}</Text>
                <Text className='time-block__customer'>{block.booking.customer_name}</Text>
                <View className={`time-block__badge time-block__badge--${block.booking.status}`}>
                  <Text className='time-block__badge-text'>
                    {block.booking.status === 'confirmed' ? '已确认' : '待确认'}
                  </Text>
                </View>
              </View>
            )}

            {block.status === 'blocked' && (
              <View className='time-block__inner'>
                <Text className='time-block__label time-block__label--blocked'>已屏蔽</Text>
                {block.blocked?.reason && (
                  <Text className='time-block__reason'>{block.blocked.reason}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}
