import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Booking } from '@/types'
import './index.scss'

interface BookingCardProps {
  booking: Booking
  onCancel?: (id: string) => void
  onConfirm?: (id: string) => void
}

const STATUS_CONFIG = {
  pending: { label: '待确认', className: 'status--pending' },
  confirmed: { label: '已确认', className: 'status--confirmed' },
  cancelled: { label: '已取消', className: 'status--cancelled' },
}

export default function BookingCard({ booking, onCancel, onConfirm }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusInfo = STATUS_CONFIG[booking.status]
  const isCancellable = booking.status === 'pending' || booking.status === 'confirmed'

  function handleToggle() {
    setIsExpanded(prev => !prev)
  }

  function handleCopy(text: string, label: string) {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: `${label}已复制`, icon: 'none', duration: 1500 })
      },
    })
  }

  function handleCancel() {
    if (!booking._id) return
    Taro.showModal({
      title: '取消预约',
      content: `确定取消 ${booking.customer_name} 的预约吗？`,
      confirmColor: '#f87171',
      success: (res) => {
        if (res.confirm && onCancel) {
          onCancel(booking._id!)
        }
      },
    })
  }

  return (
    <View className='booking-card' onClick={handleToggle}>
      <View className='booking-card__main'>
        <View className='booking-card__time'>
          <Text className='booking-card__time-text'>
            {booking.start_time}
          </Text>
          <Text className='booking-card__time-sep'>-</Text>
          <Text className='booking-card__time-text'>
            {booking.end_time}
          </Text>
        </View>

        <View className='booking-card__info'>
          <View className='booking-card__service-row'>
            <View
              className='booking-card__dot'
              style={{ backgroundColor: getServiceColor(booking.service_type) }}
            />
            <Text className='booking-card__service-name'>{booking.service_name}</Text>
          </View>
          <Text className='booking-card__customer'>{booking.customer_name}</Text>
        </View>

        <View className={`booking-card__badge ${statusInfo.className}`}>
          <Text className='booking-card__badge-text'>{statusInfo.label}</Text>
        </View>
      </View>

      <View className={`booking-card__details ${isExpanded ? 'booking-card__details--open' : ''}`}>
        <View className='booking-card__divider' />

        <View className='booking-card__detail-row' onClick={(e) => { e.stopPropagation(); handleCopy(booking.customer_phone, '手机号') }}>
          <Text className='booking-card__detail-label'>手机号</Text>
          <View className='booking-card__detail-value-wrap'>
            <Text className='booking-card__detail-value'>{booking.customer_phone}</Text>
            <Text className='booking-card__copy-hint'>点击复制</Text>
          </View>
        </View>

        <View className='booking-card__detail-row' onClick={(e) => { e.stopPropagation(); handleCopy(booking.customer_wechat, '微信号') }}>
          <Text className='booking-card__detail-label'>微信号</Text>
          <View className='booking-card__detail-value-wrap'>
            <Text className='booking-card__detail-value'>{booking.customer_wechat}</Text>
            <Text className='booking-card__copy-hint'>点击复制</Text>
          </View>
        </View>

        {booking.notes && (
          <View className='booking-card__detail-row booking-card__detail-row--notes'>
            <Text className='booking-card__detail-label'>备注</Text>
            <Text className='booking-card__detail-value'>{booking.notes}</Text>
          </View>
        )}

        {booking.status === 'pending' && onConfirm && (
          <View
            className='booking-card__confirm-btn'
            onClick={(e) => { e.stopPropagation(); onConfirm(booking._id!) }}
          >
            <Text className='booking-card__confirm-text'>确认预约</Text>
          </View>
        )}

        {isCancellable && (
          <View
            className='booking-card__cancel-btn'
            onClick={(e) => { e.stopPropagation(); handleCancel() }}
          >
            <Text className='booking-card__cancel-text'>取消预约</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const SERVICE_COLORS = ['#e8a838', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c']

function getServiceColor(serviceType: string): string {
  let hash = 0
  for (let i = 0; i < serviceType.length; i++) {
    hash = serviceType.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SERVICE_COLORS[Math.abs(hash) % SERVICE_COLORS.length]
}
