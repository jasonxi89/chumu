import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Calendar from '@/components/Calendar'
import TimeAxis from '@/components/TimeAxis'
import ActionSheet from '@/components/ActionSheet'
import { useSettings } from '@/hooks/useSettings'
import { useCalendarData } from '@/hooks/useCalendarData'
import { useDaySlots } from '@/hooks/useDaySlots'
import { formatDate } from '@/utils/time'
import { TimeSlot } from '@/types'
import './index.scss'

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [activeSlot, setActiveSlot] = useState<TimeSlot | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const { settings } = useSettings()

  const { markedDates, bookings, blockedSlots, refresh: refreshCalendar } =
    useCalendarData(currentMonth.getFullYear(), currentMonth.getMonth())

  const { slots, blockSlot, unblockSlot } = useDaySlots(
    selectedDate,
    settings,
    bookings,
    blockedSlots
  )

  function handleSlotTap(slot: TimeSlot) {
    setActiveSlot(slot)
    setBlockReason('')
    setIsSheetOpen(true)
  }

  function closeSheet() {
    setIsSheetOpen(false)
    setActiveSlot(null)
  }

  async function handleBlockSlot() {
    if (!activeSlot) return
    await blockSlot(activeSlot.time, activeSlot.endTime, blockReason || undefined)
    refreshCalendar()
    closeSheet()
  }

  async function handleUnblockSlot() {
    if (!activeSlot?.blocked?._id) return
    await unblockSlot(activeSlot.blocked._id)
    refreshCalendar()
    closeSheet()
  }

  function formatSelectedDateLabel(): string {
    const [, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(
      Number(selectedDate.split('-')[0]),
      m - 1,
      d
    )
    const weekday = WEEKDAY_NAMES[dateObj.getDay()]
    return `${m}月${d}日 ${weekday}`
  }

  function getSheetTitle(): string {
    if (!activeSlot) return ''
    switch (activeSlot.status) {
      case 'available':
        return `${activeSlot.time} - ${activeSlot.endTime}`
      case 'blocked':
        return '已屏蔽时段'
      case 'booked':
        return '预约详情'
      default:
        return ''
    }
  }

  return (
    <View className='calendar-page'>
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        markedDates={markedDates}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      <View className='calendar-page__divider'>
        <View className='calendar-page__divider-line' />
        <Text className='calendar-page__divider-label'>
          {formatSelectedDateLabel()}
        </Text>
        <View className='calendar-page__divider-line' />
      </View>

      <ScrollView
        className='calendar-page__timeline'
        scrollY
        enhanced
        showScrollbar={false}
      >
        <TimeAxis
          date={selectedDate}
          slots={slots}
          onSlotTap={handleSlotTap}
        />
        <View className='calendar-page__timeline-bottom' />
      </ScrollView>

      <ActionSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        title={getSheetTitle()}
      >
        {activeSlot?.status === 'available' && (
          <View className='sheet-body'>
            <Text className='sheet-body__hint'>
              屏蔽后该时段将无法被预约
            </Text>
            <Input
              className='sheet-body__input'
              placeholder='屏蔽原因（选填）'
              placeholderClass='sheet-body__input-placeholder'
              value={blockReason}
              onInput={e => setBlockReason(e.detail.value)}
            />
            <View className='sheet-body__btn sheet-body__btn--danger' onClick={handleBlockSlot}>
              <Text className='sheet-body__btn-text'>屏蔽此时段</Text>
            </View>
          </View>
        )}

        {activeSlot?.status === 'blocked' && (
          <View className='sheet-body'>
            {activeSlot.blocked?.reason && (
              <View className='sheet-body__detail-row'>
                <Text className='sheet-body__detail-label'>原因</Text>
                <Text className='sheet-body__detail-value'>
                  {activeSlot.blocked.reason}
                </Text>
              </View>
            )}
            <View className='sheet-body__btn sheet-body__btn--accent' onClick={handleUnblockSlot}>
              <Text className='sheet-body__btn-text'>取消屏蔽</Text>
            </View>
          </View>
        )}

        {activeSlot?.status === 'booked' && (
          <View className='sheet-body'>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>服务</Text>
              <Text className='sheet-body__detail-value'>
                {activeSlot.booking?.service_name}
              </Text>
            </View>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>客户</Text>
              <Text className='sheet-body__detail-value'>
                {activeSlot.booking?.customer_name}
              </Text>
            </View>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>电话</Text>
              <Text className='sheet-body__detail-value'>
                {activeSlot.booking?.customer_phone}
              </Text>
            </View>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>时间</Text>
              <Text className='sheet-body__detail-value'>
                {activeSlot.time} - {activeSlot.endTime}
              </Text>
            </View>
            {activeSlot.booking?.notes && (
              <View className='sheet-body__detail-row'>
                <Text className='sheet-body__detail-label'>备注</Text>
                <Text className='sheet-body__detail-value'>
                  {activeSlot.booking.notes}
                </Text>
              </View>
            )}
            <View className='sheet-body__status-badge'>
              <Text className='sheet-body__status-text'>
                {activeSlot.booking?.status === 'confirmed' ? '已确认' : '待确认'}
              </Text>
            </View>
          </View>
        )}
      </ActionSheet>
    </View>
  )
}
