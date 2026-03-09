import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initCloud } from './utils/cloud'
const APP_VERSION = '0.5.0'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log(`[初慕] v${APP_VERSION}`)
    initCloud()
  })

  return children
}

export default App
