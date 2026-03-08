import { useState, useEffect, useCallback } from 'react'
import { Service } from '@/types'
import { getCollection } from '@/utils/cloud'

const DEFAULT_SERVICES: Service[] = [
  {
    _id: 'default_1',
    name: '咨询服务',
    color: '#34d399',
    duration_options: [30, 60],
    is_active: true,
    created_at: new Date(),
  },
  {
    _id: 'default_2',
    name: '深度咨询',
    color: '#818cf8',
    duration_options: [60, 90, 120],
    is_active: true,
    created_at: new Date(),
  },
  {
    _id: 'default_3',
    name: '快速问答',
    color: '#fb923c',
    duration_options: [15, 30],
    is_active: true,
    created_at: new Date(),
  },
]

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setLoading(true)
    try {
      const res = await getCollection('services').orderBy('created_at', 'asc').get()
      if (res.data && res.data.length > 0) {
        setServices(res.data as unknown as Service[])
      } else {
        setServices(DEFAULT_SERVICES)
      }
    } catch {
      console.warn('Cloud DB not available, using default services')
      setServices(DEFAULT_SERVICES)
    } finally {
      setLoading(false)
    }
  }

  const addService = useCallback(async (service: Omit<Service, '_id' | 'created_at'>) => {
    const newService: Service = {
      ...service,
      _id: `local_${Date.now()}`,
      created_at: new Date(),
    }
    setServices(prev => [...prev, newService])
    try {
      const res = await getCollection('services').add({ data: { ...service, created_at: new Date() } })
      setServices(prev =>
        prev.map(s => s._id === newService._id ? { ...s, _id: res._id as string } : s)
      )
    } catch {
      console.warn('Cloud DB not available, service saved locally only')
    }
  }, [])

  const updateService = useCallback(async (service: Service) => {
    setServices(prev => prev.map(s => s._id === service._id ? service : s))
    try {
      if (service._id && !service._id.startsWith('local_') && !service._id.startsWith('default_')) {
        const { _id, ...data } = service
        await getCollection('services').doc(_id).update({ data })
      }
    } catch {
      console.warn('Cloud DB not available, service updated locally only')
    }
  }, [])

  const toggleService = useCallback(async (id: string, isActive: boolean) => {
    setServices(prev => prev.map(s => s._id === id ? { ...s, is_active: isActive } : s))
    try {
      if (id && !id.startsWith('local_') && !id.startsWith('default_')) {
        await getCollection('services').doc(id).update({ data: { is_active: isActive } })
      }
    } catch {
      console.warn('Cloud DB not available, toggle saved locally only')
    }
  }, [])

  const deleteService = useCallback(async (id: string) => {
    setServices(prev => prev.filter(s => s._id !== id))
    try {
      if (id && !id.startsWith('local_') && !id.startsWith('default_')) {
        await getCollection('services').doc(id).remove()
      }
    } catch {
      console.warn('Cloud DB not available, deletion applied locally only')
    }
  }, [])

  return { services, loading, addService, updateService, toggleService, deleteService }
}
