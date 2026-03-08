import { useState, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import { formatMonth, getDaysInMonth, getFirstDayOfMonth, isToday } from '@/utils/time'
import './index.scss'

interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  markedDates: Record<string, string[]>
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function Calendar({
  selectedDate,
  onDateSelect,
  markedDates,
  currentMonth,
  onMonthChange,
}: CalendarProps) {
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | ''>('')
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth)

  function goToPrevMonth() {
    setSlideDirection('right')
    setTimeout(() => {
      onMonthChange(new Date(year, month - 1, 1))
      setSlideDirection('')
    }, 200)
  }

  function goToNextMonth() {
    setSlideDirection('left')
    setTimeout(() => {
      onMonthChange(new Date(year, month + 1, 1))
      setSlideDirection('')
    }, 200)
  }

  function handleTouchStart(event) {
    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return

    if (deltaX < 0) {
      goToNextMonth()
    } else {
      goToPrevMonth()
    }
  }

  function buildDateString(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function renderPrevMonthDays() {
    const cells: JSX.Element[] = []
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i
      const dateStr = buildDateString(prevYear, prevMonth, day)
      cells.push(
        <View key={`prev-${day}`} className='calendar-cell calendar-cell--muted'>
          <Text className='calendar-cell__number'>{day}</Text>
          {renderDots(dateStr)}
        </View>
      )
    }
    return cells
  }

  function renderCurrentMonthDays() {
    const cells: JSX.Element[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = buildDateString(year, month, day)
      const isSelected = dateStr === selectedDate
      const isTodayDate = isToday(dateStr)

      const cellClass = [
        'calendar-cell',
        isSelected ? 'calendar-cell--selected' : '',
        isTodayDate && !isSelected ? 'calendar-cell--today' : '',
      ].filter(Boolean).join(' ')

      cells.push(
        <View
          key={`cur-${day}`}
          className={cellClass}
          onClick={() => onDateSelect(dateStr)}
        >
          <View className={`calendar-cell__inner ${isSelected ? 'calendar-cell__inner--selected' : ''}`}>
            <Text className='calendar-cell__number'>{day}</Text>
          </View>
          {renderDots(dateStr)}
        </View>
      )
    }
    return cells
  }

  function renderNextMonthDays() {
    const totalCells = firstDay + daysInMonth
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    const cells: JSX.Element[] = []

    for (let day = 1; day <= remaining; day++) {
      const dateStr = buildDateString(nextYear, nextMonth, day)
      cells.push(
        <View key={`next-${day}`} className='calendar-cell calendar-cell--muted'>
          <Text className='calendar-cell__number'>{day}</Text>
          {renderDots(dateStr)}
        </View>
      )
    }
    return cells
  }

  function renderDots(dateStr: string) {
    const dots = markedDates[dateStr]
    if (!dots || dots.length === 0) return <View className='calendar-cell__dots calendar-cell__dots--empty' />

    return (
      <View className='calendar-cell__dots'>
        {dots.slice(0, 3).map((color, index) => (
          <View
            key={index}
            className='calendar-cell__dot'
            style={{ backgroundColor: color }}
          />
        ))}
      </View>
    )
  }

  const gridClass = [
    'calendar-grid',
    slideDirection === 'left' ? 'calendar-grid--slide-left' : '',
    slideDirection === 'right' ? 'calendar-grid--slide-right' : '',
  ].filter(Boolean).join(' ')

  return (
    <View className='calendar'>
      <View className='calendar-header'>
        <View className='calendar-header__arrow' onClick={goToPrevMonth}>
          <Text className='calendar-header__arrow-icon'>&#8249;</Text>
        </View>
        <Text className='calendar-header__title'>{formatMonth(currentMonth)}</Text>
        <View className='calendar-header__arrow' onClick={goToNextMonth}>
          <Text className='calendar-header__arrow-icon'>&#8250;</Text>
        </View>
      </View>

      <View className='calendar-weekdays'>
        {WEEKDAYS.map(day => (
          <View key={day} className='calendar-weekday'>
            <Text className='calendar-weekday__text'>{day}</Text>
          </View>
        ))}
      </View>

      <View
        className={gridClass}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderPrevMonthDays()}
        {renderCurrentMonthDays()}
        {renderNextMonthDays()}
      </View>
    </View>
  )
}
