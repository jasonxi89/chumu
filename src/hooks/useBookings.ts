import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Booking } from '@/types'
import { getCollection } from '@/utils/cloud'
import { formatDate, addMinutes } from '@/utils/time'

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'

interface NewBookingData {
  date: string
  start_time: string
  duration: number
  service_type: string
  service_name: string
  customer_name: string
  customer_phone?: string
  customer_wechat?: string
  notes?: string
}

function buildMockBookings(): Booking[] {
  const today = formatDate(new Date())
  const tomorrow = formatDate(new Date(Date.now() + 86400000))
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  return [
    {
      _id: 'mock_1',
      date: today,
      start_time: '10:00',
      end_time: '11:00',
      duration: 60,
      service_type: 'facial',
      service_name: '面部护理',
      customer_name: '张三',
      customer_phone: '13800138001',
      customer_wechat: 'zhangsan_wx',
      notes: '敏感肌，需要温和产品',
      status: 'confirmed',
      openid: '',
      created_at: new Date(),
    },
    {
      _id: 'mock_2',
      date: today,
      start_time: '14:00',
      end_time: '15:30',
      duration: 90,
      service_type: 'nail',
      service_name: '美甲设计',
      customer_name: '李四',
      customer_phone: '13900139002',
      customer_wechat: 'lisi_wx',
      status: 'pending',
      openid: '',
      created_at: new Date(),
    },
    {
      _id: 'mock_3',
      date: tomorrow,
      start_time: '09:00',
      end_time: '10:30',
      duration: 90,
      service_type: 'facial',
      service_name: '面部护理',
      customer_name: '王五',
      customer_phone: '13700137003',
      notes: '第二次护理',
      status: 'pending',
      openid: '',
      created_at: new Date(),
    },
    {
      _id: 'mock_4',
      date: yesterday,
      start_time: '16:00',
      end_time: '17:00',
      duration: 60,
      service_type: 'nail',
      service_name: '美甲设计',
      customer_name: '赵六',
      customer_phone: '13600136004',
      status: 'cancelled',
      openid: '',
      created_at: new Date(),
    },
    {
      _id: 'mock_5',
      date: yesterday,
      start_time: '11:00',
      end_time: '11:30',
      duration: 30,
      service_type: 'touch_up',
      service_name: '快速补妆',
      customer_name: '孙七',
      customer_phone: '13500135005',
      status: 'confirmed',
      openid: '',
      created_at: new Date(),
    },
  ]
}

export function useBookings(filter: BookingFilter) {
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const filteredBookings = filterBookings(allBookings, filter)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCollection('bookings')
        .orderBy('date', 'desc')
        .orderBy('start_time', 'asc')
        .limit(100)
        .get()

      if (res.data && res.data.length > 0) {
        setAllBookings(res.data as unknown as Booking[])
      } else {
        setAllBookings(buildMockBookings())
      }
    } catch {
      console.warn('Cloud DB not available, using mock bookings')
      setAllBookings(buildMockBookings())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const cancelBooking = useCallback(async (id: string) => {
    try {
      await getCollection('bookings').doc(id).update({
        data: { status: 'cancelled' },
      })
    } catch {
      console.warn('Cloud update failed, updating locally')
    }
    setAllBookings(prev =>
      prev.map(b => (b._id === id ? { ...b, status: 'cancelled' as const } : b))
    )
    Taro.showToast({ title: '已取消', icon: 'none' })
  }, [])

  const addBooking = useCallback(async (data: NewBookingData) => {
    const endTime = addMinutes(data.start_time, data.duration)
    const newBooking: Booking = {
      ...data,
      end_time: endTime,
      status: 'pending',
      openid: '',
      created_at: new Date(),
    }

    try {
      const res = await getCollection('bookings').add({ data: newBooking })
      newBooking._id = (res as any)._id || `local_${Date.now()}`
    } catch {
      console.warn('Cloud add failed, adding locally')
      newBooking._id = `local_${Date.now()}`
    }

    setAllBookings(prev => sortBookings([newBooking, ...prev]))
    Taro.showToast({ title: '添加成功', icon: 'none' })
  }, [])

  return {
    bookings: filteredBookings,
    loading,
    refresh: fetchBookings,
    cancelBooking,
    addBooking,
  }
}

function filterBookings(bookings: Booking[], filter: BookingFilter): Booking[] {
  if (filter === 'all') return bookings
  return bookings.filter(b => b.status === filter)
}

function sortBookings(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return a.start_time.localeCompare(b.start_time)
  })
}
