import { useState, useRef } from 'react'
import { View, Text, Switch, ITouchEvent } from '@tarojs/components'
import { Service } from '@/types'
import { formatDuration } from '@/utils/time'
import './index.scss'

interface ServiceItemProps {
  service: Service
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onEdit: (service: Service) => void
}

export default function ServiceItem({ service, onToggle, onDelete, onEdit }: ServiceItemProps) {
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(0)
  const isDragging = useRef(false)

  const DELETE_THRESHOLD = 80

  function handleTouchStart(event: ITouchEvent) {
    startX.current = event.touches[0].clientX
    isDragging.current = false
  }

  function handleTouchMove(event: ITouchEvent) {
    const deltaX = event.touches[0].clientX - startX.current
    if (deltaX < -10) {
      isDragging.current = true
      setOffsetX(Math.max(deltaX, -DELETE_THRESHOLD))
    } else if (deltaX > 10 && offsetX < 0) {
      isDragging.current = true
      setOffsetX(Math.min(0, offsetX + deltaX))
    }
  }

  function handleTouchEnd() {
    if (offsetX < -DELETE_THRESHOLD / 2) {
      setOffsetX(-DELETE_THRESHOLD)
    } else {
      setOffsetX(0)
    }
  }

  function handleTap() {
    if (isDragging.current) return
    if (offsetX < 0) {
      setOffsetX(0)
      return
    }
    onEdit(service)
  }

  function handleToggle(event: { stopPropagation: () => void }) {
    event.stopPropagation()
    onToggle(service._id!, !service.is_active)
  }

  function handleDelete() {
    onDelete(service._id!)
  }

  return (
    <View className='service-item'>
      <View className='service-item__delete-zone' onClick={handleDelete}>
        <Text className='service-item__delete-text'>删除</Text>
      </View>
      <View
        className={`service-item__content ${!service.is_active ? 'service-item__content--inactive' : ''}`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        <View className='service-item__left'>
          <View className='service-item__header'>
            <View
              className='service-item__dot'
              style={{ backgroundColor: service.color }}
            />
            <Text className='service-item__name'>{service.name}</Text>
          </View>
          <View className='service-item__durations'>
            {service.duration_options.map(dur => (
              <View key={dur} className='service-item__chip'>
                <Text className='service-item__chip-text'>{formatDuration(dur)}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className='service-item__right' onClick={e => e.stopPropagation()}>
          <Switch
            checked={service.is_active}
            onChange={handleToggle}
            color='#e8a838'
            className='service-item__switch'
          />
        </View>
      </View>
    </View>
  )
}
