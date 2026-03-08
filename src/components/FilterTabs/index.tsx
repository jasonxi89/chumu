import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

interface FilterTabsProps {
  tabs: { key: string; label: string }[]
  activeKey: string
  onChange: (key: string) => void
}

export default function FilterTabs({ tabs, activeKey, onChange }: FilterTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const index = tabs.findIndex(tab => tab.key === activeKey)
    if (index >= 0) setActiveIndex(index)
  }, [activeKey, tabs])

  function handleTap(key: string) {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
    onChange(key)
  }

  return (
    <ScrollView scrollX className='filter-tabs' enhanced showScrollbar={false}>
      <View className='filter-tabs__track'>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex
          return (
            <View
              key={tab.key}
              className={`filter-tabs__pill ${isActive ? 'filter-tabs__pill--active' : ''}`}
              onClick={() => handleTap(tab.key)}
            >
              <Text className='filter-tabs__label'>{tab.label}</Text>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
