import { useRef } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function ActionSheet({ isOpen, onClose, title, children }: ActionSheetProps) {
  const touchStartY = useRef(0)

  function handleTouchStart(event) {
    touchStartY.current = event.touches[0].clientY
  }

  function handleTouchEnd(event) {
    const deltaY = event.changedTouches[0].clientY - touchStartY.current
    if (deltaY > 80) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <View className='action-sheet'>
      <View
        className='action-sheet__backdrop'
        onClick={onClose}
        catchMove
      />
      <View
        className='action-sheet__panel'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <View className='action-sheet__handle-bar' />
        <Text className='action-sheet__title'>{title}</Text>
        <View className='action-sheet__content'>
          {children}
        </View>
      </View>
    </View>
  )
}
