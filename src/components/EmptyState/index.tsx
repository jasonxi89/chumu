import { View, Text } from '@tarojs/components'
import './index.scss'

interface EmptyStateProps {
  icon?: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon = '', title, subtitle }: EmptyStateProps) {
  return (
    <View className='empty-state'>
      {icon && <Text className='empty-state__icon'>{icon}</Text>}
      <Text className='empty-state__title'>{title}</Text>
      {subtitle && <Text className='empty-state__subtitle'>{subtitle}</Text>}
    </View>
  )
}
