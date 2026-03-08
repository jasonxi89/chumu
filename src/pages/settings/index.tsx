import { useState, useCallback } from 'react'
import { View, Text, Input, Picker, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Service } from '@/types'
import { useSettings } from '@/hooks/useSettings'
import { useServices } from '@/hooks/useServices'
import ServiceItem from '@/components/ServiceItem'
import './index.scss'

const INTERVAL_OPTIONS = [15, 30, 60]

const COLOR_PALETTE = [
  '#34d399', '#2dd4bf', '#22d3ee', '#60a5fa',
  '#818cf8', '#a78bfa', '#e879f9', '#f472b6',
  '#fb923c', '#facc15', '#a3e635', '#f87171',
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

interface ServiceFormData {
  name: string
  color: string
  duration_options: number[]
}

const EMPTY_FORM: ServiceFormData = {
  name: '',
  color: '#34d399',
  duration_options: [30],
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { services, addService, updateService, toggleService, deleteService } = useServices()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM)

  const isFormOpen = isAdding || editingId !== null

  const handleStartTimeChange = useCallback((event) => {
    if (!settings) return
    updateSettings({
      business_hours: { ...settings.business_hours, start: event.detail.value },
    })
  }, [settings, updateSettings])

  const handleEndTimeChange = useCallback((event) => {
    if (!settings) return
    updateSettings({
      business_hours: { ...settings.business_hours, end: event.detail.value },
    })
  }, [settings, updateSettings])

  const handleIntervalChange = useCallback((interval: number) => {
    updateSettings({ time_slot_interval: interval })
  }, [updateSettings])

  function handleAddTap() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setIsAdding(true)
  }

  function handleEditService(service: Service) {
    setIsAdding(false)
    setEditingId(service._id!)
    setFormData({
      name: service.name,
      color: service.color,
      duration_options: [...service.duration_options],
    })
  }

  function handleCancelForm() {
    setIsAdding(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  function handleToggleDuration(duration: number) {
    setFormData(prev => {
      const hasIt = prev.duration_options.includes(duration)
      if (hasIt && prev.duration_options.length === 1) return prev
      const next = hasIt
        ? prev.duration_options.filter(d => d !== duration)
        : [...prev.duration_options, duration].sort((a, b) => a - b)
      return { ...prev, duration_options: next }
    })
  }

  function handleSaveForm() {
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      Taro.showToast({ title: '请输入服务名称', icon: 'none' })
      return
    }
    if (formData.duration_options.length === 0) {
      Taro.showToast({ title: '请至少选择一个时长', icon: 'none' })
      return
    }

    if (editingId) {
      const existing = services.find(s => s._id === editingId)
      if (existing) {
        updateService({
          ...existing,
          name: trimmedName,
          color: formData.color,
          duration_options: formData.duration_options,
        })
      }
    } else {
      addService({
        name: trimmedName,
        color: formData.color,
        duration_options: formData.duration_options,
        is_active: true,
      })
    }

    handleCancelForm()
    Taro.showToast({ title: '已保存', icon: 'success' })
  }

  function handleDeleteService(id: string) {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定删除此服务？',
      confirmColor: '#f87171',
      success(res) {
        if (res.confirm) deleteService(id)
      },
    })
  }

  function formatDurationLabel(minutes: number): string {
    if (minutes >= 60) {
      const hours = minutes / 60
      return Number.isInteger(hours) ? `${hours}小时` : `${minutes}分`
    }
    return `${minutes}分`
  }

  if (!settings) return <View className='settings-page' />

  return (
    <ScrollView scrollY className='settings-page' enhanced showScrollbar={false}>
      <View className='settings-page__inner'>
        {/* Section: Business Hours */}
        <View className='section'>
          <Text className='section__title'>营业时间</Text>
          <View className='card'>
            <Picker mode='time' value={settings.business_hours.start} onChange={handleStartTimeChange}>
              <View className='card__row'>
                <Text className='card__label'>开始时间</Text>
                <View className='card__value-group'>
                  <Text className='card__value'>{settings.business_hours.start}</Text>
                  <Text className='card__arrow'>›</Text>
                </View>
              </View>
            </Picker>
            <View className='card__divider' />
            <Picker mode='time' value={settings.business_hours.end} onChange={handleEndTimeChange}>
              <View className='card__row'>
                <Text className='card__label'>结束时间</Text>
                <View className='card__value-group'>
                  <Text className='card__value'>{settings.business_hours.end}</Text>
                  <Text className='card__arrow'>›</Text>
                </View>
              </View>
            </Picker>
            <View className='card__divider' />
            <View className='card__row card__row--stacked'>
              <Text className='card__label'>时间间隔</Text>
              <View className='segment-control'>
                {INTERVAL_OPTIONS.map(interval => (
                  <View
                    key={interval}
                    className={`segment-control__item ${settings.time_slot_interval === interval ? 'segment-control__item--active' : ''}`}
                    onClick={() => handleIntervalChange(interval)}
                  >
                    <Text className={`segment-control__text ${settings.time_slot_interval === interval ? 'segment-control__text--active' : ''}`}>
                      {interval}分
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Section: Services */}
        <View className='section'>
          <View className='section__header'>
            <Text className='section__title'>服务类型</Text>
            {!isFormOpen && (
              <View className='section__action' onClick={handleAddTap}>
                <Text className='section__action-text'>+ 添加</Text>
              </View>
            )}
          </View>

          {/* Inline form for add/edit */}
          {isFormOpen && (
            <View className='service-form'>
              <View className='service-form__field'>
                <Text className='service-form__label'>名称</Text>
                <Input
                  className='service-form__input'
                  value={formData.name}
                  onInput={e => setFormData(prev => ({ ...prev, name: e.detail.value }))}
                  placeholder='输入服务名称'
                  placeholderClass='service-form__placeholder'
                  maxlength={20}
                />
              </View>

              <View className='service-form__field'>
                <Text className='service-form__label'>颜色</Text>
                <View className='color-palette'>
                  {COLOR_PALETTE.map(color => (
                    <View
                      key={color}
                      className={`color-palette__item ${formData.color === color ? 'color-palette__item--selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    >
                      {formData.color === color && (
                        <Text className='color-palette__check'>✓</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <View className='service-form__field'>
                <Text className='service-form__label'>时长选项</Text>
                <View className='duration-chips'>
                  {DURATION_OPTIONS.map(dur => {
                    const isSelected = formData.duration_options.includes(dur)
                    return (
                      <View
                        key={dur}
                        className={`duration-chips__item ${isSelected ? 'duration-chips__item--selected' : ''}`}
                        onClick={() => handleToggleDuration(dur)}
                      >
                        <Text className={`duration-chips__text ${isSelected ? 'duration-chips__text--selected' : ''}`}>
                          {formatDurationLabel(dur)}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>

              <View className='service-form__actions'>
                <View className='service-form__btn service-form__btn--cancel' onClick={handleCancelForm}>
                  <Text className='service-form__btn-text service-form__btn-text--cancel'>取消</Text>
                </View>
                <View className='service-form__btn service-form__btn--save' onClick={handleSaveForm}>
                  <Text className='service-form__btn-text service-form__btn-text--save'>保存</Text>
                </View>
              </View>
            </View>
          )}

          {/* Service list */}
          {services.length > 0 ? (
            <View className='service-list'>
              {services.map(service => (
                <ServiceItem
                  key={service._id}
                  service={service}
                  onToggle={toggleService}
                  onDelete={handleDeleteService}
                  onEdit={handleEditService}
                />
              ))}
            </View>
          ) : (
            !isFormOpen && (
              <View className='empty-state'>
                <Text className='empty-state__icon'>📋</Text>
                <Text className='empty-state__text'>暂无服务类型</Text>
                <Text className='empty-state__hint'>点击上方"添加"创建你的第一个服务</Text>
              </View>
            )
          )}
        </View>

        {/* Section: About */}
        <View className='section section--about'>
          <Text className='about__name'>初慕 v0.1.0</Text>
          <Text className='about__desc'>日历预约助手</Text>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className='settings-page__bottom-spacer' />
      </View>
    </ScrollView>
  )
}
