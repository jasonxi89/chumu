import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initCloud } from './utils/cloud'
import { APP_VERSION } from './utils/version'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log(`[初慕] v${APP_VERSION}`)
    initCloud()
  })

  return children
}

export default App
