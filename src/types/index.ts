export interface Service {
  _id?: string
  name: string
  duration_options: number[]
  color: string
  is_active: boolean
  created_at: Date
}

export interface BlockedSlot {
  _id?: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  created_at: Date
}

export interface Booking {
  _id?: string
  date: string
  start_time: string
  end_time: string
  duration: number
  service_type: string
  service_name: string
  customer_name: string
  customer_phone: string
  customer_wechat: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  openid: string
  created_at: Date
}

export interface Settings {
  _id?: string
  owner_openid: string
  business_hours: {
    start: string
    end: string
  }
  time_slot_interval: number
}

export interface TimeSlot {
  time: string
  endTime: string
  status: 'available' | 'blocked' | 'booked'
  booking?: Booking
  blocked?: BlockedSlot
}

export interface TimeBlock {
  startTime: string
  endTime: string
  status: 'available' | 'blocked' | 'booked'
  booking?: Booking
  blocked?: BlockedSlot
}
