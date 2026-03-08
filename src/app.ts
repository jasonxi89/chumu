import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initCloud } from './utils/cloud'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    initCloud()
  })

  return children
}

export default App
