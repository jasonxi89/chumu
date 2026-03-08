import { View, Text } from '@tarojs/components'
import { TimeSlot } from '@/types'
import './index.scss'

interface TimeAxisProps {
  date: string
  slots: TimeSlot[]
  onSlotTap: (slot: TimeSlot) => void
}

export default function TimeAxis({ date, slots, onSlotTap }: TimeAxisProps) {
  if (slots.length === 0) {
    return (
      <View className='time-axis time-axis--empty'>
        <Text className='time-axis__empty-text'>暂无时段数据</Text>
      </View>
    )
  }

  return (
    <View className='time-axis'>
      {slots.map((slot, index) => (
        <View
          key={`${date}-${slot.time}`}
          className='time-axis__row'
          onClick={() => onSlotTap(slot)}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <View className='time-axis__time-col'>
            <Text className='time-axis__time-label'>{slot.time}</Text>
          </View>

          <View className='time-axis__line-col'>
            <View className='time-axis__line' />
            <View className={`time-axis__node time-axis__node--${slot.status}`} />
          </View>

          <View className={`time-axis__slot time-axis__slot--${slot.status}`}>
            {renderSlotContent(slot)}
          </View>
        </View>
      ))}
    </View>
  )
}

function renderSlotContent(slot: TimeSlot) {
  switch (slot.status) {
    case 'available':
      return (
        <View className='time-axis__slot-inner'>
          <Text className='time-axis__slot-label'>可预约</Text>
          <Text className='time-axis__slot-range'>
            {slot.time} - {slot.endTime}
          </Text>
        </View>
      )

    case 'blocked':
      return (
        <View className='time-axis__slot-inner'>
          <View className='time-axis__slot-stripe' />
          <Text className='time-axis__slot-label time-axis__slot-label--blocked'>
            已屏蔽
          </Text>
          {slot.blocked?.reason && (
            <Text className='time-axis__slot-reason'>{slot.blocked.reason}</Text>
          )}
        </View>
      )

    case 'booked':
      return (
        <View className='time-axis__slot-inner'>
          <Text className='time-axis__slot-service'>
            {slot.booking?.service_name}
          </Text>
          <Text className='time-axis__slot-customer'>
            {slot.booking?.customer_name}
          </Text>
          <Text className='time-axis__slot-range'>
            {slot.time} - {slot.endTime}
          </Text>
        </View>
      )

    default:
      return null
  }
}
