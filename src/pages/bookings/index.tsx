import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input, Picker } from '@tarojs/components'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro'
import FilterTabs from '@/components/FilterTabs'
import BookingCard from '@/components/BookingCard'
import EmptyState from '@/components/EmptyState'
import { useBookings } from '@/hooks/useBookings'
import { Booking } from '@/types'
import { formatDate, parseDate } from '@/utils/time'
import './index.scss'

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'cancelled', label: '已取消' },
]

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

interface BookingForm {
  date: string
  startTime: string
  endTime: string
  serviceType: string
  customerName: string
  customerPhone: string
  customerWechat: string
  notes: string
}

const INITIAL_FORM: BookingForm = {
  date: formatDate(new Date()),
  startTime: '10:00',
  endTime: '11:00',
  serviceType: '',
  customerName: '',
  customerPhone: '',
  customerWechat: '',
  notes: '',
}

export default function BookingsPage() {
  const [filter, setFilter] = useState('all')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [form, setForm] = useState<BookingForm>({ ...INITIAL_FORM })
  const { bookings, loading, refresh, confirmBooking, cancelBooking, addBooking } = useBookings(
    filter as 'all' | 'pending' | 'confirmed' | 'cancelled'
  )

  usePullDownRefresh(async () => {
    await refresh()
    Taro.stopPullDownRefresh()
  })

  // Check for prefill from calendar page
  useDidShow(() => {
    const prefill = Taro.getStorageSync('prefill_booking')
    if (prefill) {
      Taro.removeStorageSync('prefill_booking')
      setForm(prev => ({
        ...prev,
        date: prefill.date || prev.date,
        startTime: prefill.startTime || prev.startTime,
        endTime: prefill.endTime || prev.endTime,
      }))
      setIsSheetOpen(true)
    }
  })

  const groupedBookings = useMemo(() => groupByDate(bookings), [bookings])

  function computeDuration(): number {
    const [sh, sm] = form.startTime.split(':').map(Number)
    const [eh, em] = form.endTime.split(':').map(Number)
    return (eh * 60 + em) - (sh * 60 + sm)
  }

  function handleSubmit() {
    if (!form.customerName.trim()) {
      Taro.showToast({ title: '请输入客户姓名', icon: 'none' })
      return
    }
    const duration = computeDuration()
    if (duration <= 0) {
      Taro.showToast({ title: '结束时间须晚于开始时间', icon: 'none' })
      return
    }

    addBooking({
      date: form.date,
      start_time: form.startTime,
      duration,
      service_type: form.serviceType || 'general',
      service_name: form.serviceType || '通用服务',
      customer_name: form.customerName.trim(),
      customer_phone: form.customerPhone.trim() || undefined,
      customer_wechat: form.customerWechat.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })

    setIsSheetOpen(false)
    setForm({ ...INITIAL_FORM })
  }

  function updateField<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <View className='bookings-page'>
      {/* Header */}
      <View className='bookings-page__header'>
        <Text className='bookings-page__title'>预约列表</Text>
        <View className='bookings-page__add-btn' onClick={() => setIsSheetOpen(true)}>
          <Text className='bookings-page__add-text'>+ 添加</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <FilterTabs tabs={FILTER_TABS} activeKey={filter} onChange={setFilter} />

      {/* Content */}
      {loading ? (
        <View className='bookings-page__loading'>
          <Text className='bookings-page__loading-text'>加载中...</Text>
        </View>
      ) : groupedBookings.length === 0 ? (
        <EmptyState
          icon='📋'
          title='暂无预约'
          subtitle={filter === 'all' ? '点击右上角添加第一个预约' : '当前筛选条件下没有预约'}
        />
      ) : (
        <ScrollView scrollY className='bookings-page__list' enhanced showScrollbar={false}>
          {groupedBookings.map(group => (
            <View key={group.date} className='bookings-page__group'>
              <View className='bookings-page__date-header'>
                <Text className='bookings-page__date-text'>
                  {formatDateLabel(group.date)}
                </Text>
                <Text className='bookings-page__date-count'>
                  {group.bookings.length} 个预约
                </Text>
              </View>
              {group.bookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onConfirm={confirmBooking}
                  onCancel={cancelBooking}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Bottom sheet overlay */}
      {isSheetOpen && (
        <View className='sheet-overlay' onClick={() => setIsSheetOpen(false)}>
          <View className='sheet' onClick={(e) => e.stopPropagation()}>
            <View className='sheet__handle' />

            <View className='sheet__header'>
              <Text className='sheet__title'>添加预约</Text>
              <View className='sheet__close' onClick={() => setIsSheetOpen(false)}>
                <Text className='sheet__close-icon'>✕</Text>
              </View>
            </View>

            <ScrollView scrollY className='sheet__body' enhanced showScrollbar={false}>
              <View className='sheet__body-inner'>
              {/* Date */}
              <View className='form-field'>
                <Text className='form-field__label'>日期</Text>
                <Picker
                  mode='date'
                  value={form.date}
                  onChange={(e) => updateField('date', e.detail.value)}
                >
                  <View className='form-field__picker'>
                    <Text className='form-field__picker-text'>{form.date}</Text>
                    <Text className='form-field__picker-arrow'>▾</Text>
                  </View>
                </Picker>
              </View>

              {/* Start time */}
              <View className='form-field'>
                <Text className='form-field__label'>开始时间</Text>
                <Picker
                  mode='time'
                  value={form.startTime}
                  onChange={(e) => updateField('startTime', e.detail.value)}
                >
                  <View className='form-field__picker'>
                    <Text className='form-field__picker-text'>{form.startTime}</Text>
                    <Text className='form-field__picker-arrow'>▾</Text>
                  </View>
                </Picker>
              </View>

              {/* End time */}
              <View className='form-field'>
                <Text className='form-field__label'>结束时间</Text>
                <Picker
                  mode='time'
                  value={form.endTime}
                  onChange={(e) => updateField('endTime', e.detail.value)}
                >
                  <View className='form-field__picker'>
                    <Text className='form-field__picker-text'>{form.endTime}</Text>
                    <Text className='form-field__picker-arrow'>▾</Text>
                  </View>
                </Picker>
              </View>

              {/* Service type */}
              <View className='form-field'>
                <Text className='form-field__label'>服务类型</Text>
                <View className='form-field__input-wrap'>
                  <Input
                    className='form-field__input'
                    value={form.serviceType}
                    placeholder='如：面部护理、美甲设计'
                    placeholderClass='form-field__placeholder'
                    onInput={(e) => updateField('serviceType', e.detail.value)}
                  />
                </View>
              </View>

              {/* Customer name */}
              <View className='form-field'>
                <Text className='form-field__label'>客户姓名</Text>
                <View className='form-field__input-wrap'>
                  <Input
                    className='form-field__input'
                    value={form.customerName}
                    placeholder='请输入客户姓名'
                    placeholderClass='form-field__placeholder'
                    onInput={(e) => updateField('customerName', e.detail.value)}
                  />
                </View>
              </View>

              {/* Phone */}
              <View className='form-field'>
                <Text className='form-field__label'>手机号</Text>
                <View className='form-field__input-wrap'>
                  <Input
                    className='form-field__input'
                    type='number'
                    value={form.customerPhone}
                    placeholder='选填'
                    placeholderClass='form-field__placeholder'
                    onInput={(e) => updateField('customerPhone', e.detail.value)}
                  />
                </View>
              </View>

              {/* WeChat */}
              <View className='form-field'>
                <Text className='form-field__label'>微信号</Text>
                <View className='form-field__input-wrap'>
                  <Input
                    className='form-field__input'
                    value={form.customerWechat}
                    placeholder='选填'
                    placeholderClass='form-field__placeholder'
                    onInput={(e) => updateField('customerWechat', e.detail.value)}
                  />
                </View>
              </View>

              {/* Notes */}
              <View className='form-field'>
                <Text className='form-field__label'>备注</Text>
                <View className='form-field__input-wrap'>
                  <Input
                    className='form-field__input'
                    value={form.notes}
                    placeholder='选填'
                    placeholderClass='form-field__placeholder'
                    onInput={(e) => updateField('notes', e.detail.value)}
                  />
                </View>
              </View>

              {/* Submit */}
              <View className='sheet__submit' onClick={handleSubmit}>
                <Text className='sheet__submit-text'>确认添加</Text>
              </View>

              {/* Bottom safe area */}
              <View style={{ height: '60px' }} />
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}

interface DateGroup {
  date: string
  bookings: Booking[]
}

function groupByDate(bookings: Booking[]): DateGroup[] {
  const map = new Map<string, Booking[]>()
  for (const booking of bookings) {
    const list = map.get(booking.date) || []
    list.push(booking)
    map.set(booking.date, list)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, bookings: items }))
}

function formatDateLabel(dateStr: string): string {
  const date = parseDate(dateStr)
  const weekday = WEEKDAY_NAMES[date.getDay()]
  const today = formatDate(new Date())
  const tomorrow = formatDate(new Date(Date.now() + 86400000))
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let prefix = ''
  if (dateStr === today) prefix = '今天  '
  else if (dateStr === tomorrow) prefix = '明天  '
  else if (dateStr === yesterday) prefix = '昨天  '

  return `${prefix}${year}年${month}月${day}日 ${weekday}`
}
