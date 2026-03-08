import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import Calendar from '@/components/Calendar'
import TimeAxis from '@/components/TimeAxis'
import ActionSheet from '@/components/ActionSheet'
import { useSettings } from '@/hooks/useSettings'
import { useCalendarData } from '@/hooks/useCalendarData'
import { useDaySlots } from '@/hooks/useDaySlots'
import { formatDate } from '@/utils/time'
import { TimeBlock } from '@/types'
import './index.scss'

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const { settings } = useSettings()

  const { markedDates, bookings, blockedSlots, refresh: refreshCalendar } =
    useCalendarData(currentMonth.getFullYear(), currentMonth.getMonth())

  const { rows, blockSlot, unblockSlot, refresh: refreshSlots } = useDaySlots(
    selectedDate,
    settings,
    bookings,
    blockedSlots
  )

  useDidShow(() => {
    refreshCalendar()
    refreshSlots()
  })

  function handleBlockTap(block: TimeBlock) {
    if (block.status === 'available') {
      // Navigate to bookings page with pre-filled time
      Taro.switchTab({ url: '/pages/bookings/index' })
      // Store params for bookings page to pick up
      Taro.setStorageSync('prefill_booking', {
        date: selectedDate,
        startTime: block.startTime,
        endTime: block.endTime,
      })
      return
    }

    setActiveBlock(block)
    setBlockReason('')
    setIsSheetOpen(true)
  }

  function closeSheet() {
    setIsSheetOpen(false)
    setActiveBlock(null)
  }

  async function handleBlockSlot() {
    if (!activeBlock) return
    await blockSlot(activeBlock.startTime, activeBlock.endTime, blockReason || undefined)
    refreshCalendar()
    closeSheet()
  }

  async function handleUnblockSlot() {
    if (!activeBlock?.blocked?._id) return
    await unblockSlot(activeBlock.blocked._id)
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
    if (!activeBlock) return ''
    switch (activeBlock.status) {
      case 'blocked':
        return `已屏蔽 ${activeBlock.startTime} - ${activeBlock.endTime}`
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
          rows={rows}
          onBlockTap={handleBlockTap}
        />
        <View className='calendar-page__timeline-bottom' />
      </ScrollView>

      <ActionSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        title={getSheetTitle()}
      >
        {activeBlock?.status === 'blocked' && (
          <View className='sheet-body'>
            {activeBlock.blocked?.reason && (
              <View className='sheet-body__detail-row'>
                <Text className='sheet-body__detail-label'>原因</Text>
                <Text className='sheet-body__detail-value'>
                  {activeBlock.blocked.reason}
                </Text>
              </View>
            )}
            <View className='sheet-body__btn sheet-body__btn--accent' onClick={handleUnblockSlot}>
              <Text className='sheet-body__btn-text'>取消屏蔽</Text>
            </View>
          </View>
        )}

        {activeBlock?.status === 'booked' && (
          <View className='sheet-body'>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>服务</Text>
              <Text className='sheet-body__detail-value'>
                {activeBlock.booking?.service_name}
              </Text>
            </View>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>客户</Text>
              <Text className='sheet-body__detail-value'>
                {activeBlock.booking?.customer_name}
              </Text>
            </View>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>电话</Text>
              <Text className='sheet-body__detail-value'>
                {activeBlock.booking?.customer_phone}
              </Text>
            </View>
            <View className='sheet-body__detail-row'>
              <Text className='sheet-body__detail-label'>时间</Text>
              <Text className='sheet-body__detail-value'>
                {activeBlock.startTime} - {activeBlock.endTime}
              </Text>
            </View>
            {activeBlock.booking?.notes && (
              <View className='sheet-body__detail-row'>
                <Text className='sheet-body__detail-label'>备注</Text>
                <Text className='sheet-body__detail-value'>
                  {activeBlock.booking.notes}
                </Text>
              </View>
            )}
            <View className='sheet-body__status-badge'>
              <Text className='sheet-body__status-text'>
                {activeBlock.booking?.status === 'confirmed' ? '已确认' : '待确认'}
              </Text>
            </View>
          </View>
        )}
      </ActionSheet>
    </View>
  )
}
