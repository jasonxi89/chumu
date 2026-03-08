import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initCloud } from './utils/cloud'
// @ts-ignore
import { version } from '../package.json'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log(`[初慕] v${version}`)
    initCloud()
  })

  return children
}

export default App
