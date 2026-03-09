import { useState, useEffect, useCallback } from 'react'
import { Settings } from '@/types'
import { getCollection } from '@/utils/cloud'

const DEFAULT_SETTINGS: Settings = {
  owner_openid: '',
  business_hours: { start: '00:00', end: '24:00' },
  time_slot_interval: 30,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await getCollection('settings').limit(1).get()
      if (res.data && res.data.length > 0) {
        setSettings(res.data[0] as unknown as Settings)
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
    } catch {
      console.warn('Cloud DB not available, using default settings')
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const updated = { ...settings, ...patch } as Settings
    setSettings(updated)
    try {
      if (updated._id) {
        const { _id, ...data } = updated
        await getCollection('settings').doc(_id).update({ data })
      } else {
        const res = await getCollection('settings').add({ data: updated })
        setSettings({ ...updated, _id: res._id as string })
      }
    } catch {
      console.warn('Cloud DB not available, settings saved locally only')
    }
  }, [settings])

  return { settings, loading, updateSettings, refresh: fetchSettings }
}
