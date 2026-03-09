import { useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getTheme, THEMES } from '@/utils/themes'

const STORAGE_KEY = 'chumu_theme'

export function useTheme() {
  const [themeKey, setThemeKey] = useState(() => {
    return Taro.getStorageSync(STORAGE_KEY) || 'ink-gold'
  })

  const theme = getTheme(themeKey)

  // Build inline style string with all CSS variables
  const themeStyle = Object.entries(theme.vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';') + `;background-color:${theme.vars['--color-bg']};color:${theme.vars['--color-text-primary']}`

  const switchTheme = useCallback((key: string) => {
    setThemeKey(key)
    Taro.setStorageSync(STORAGE_KEY, key)
    const t = getTheme(key)

    // Update tabBar and navBar colors
    try {
      Taro.setTabBarStyle({
        color: t.tabBar.color,
        selectedColor: t.tabBar.selectedColor,
        backgroundColor: t.tabBar.backgroundColor,
        borderStyle: 'black',
      })
    } catch {}

    try {
      Taro.setNavigationBarColor({
        frontColor: t.navBar.textStyle === 'white' ? '#ffffff' : '#000000',
        backgroundColor: t.navBar.backgroundColor,
        animation: { duration: 200, timingFunc: 'easeIn' },
      })
    } catch {}
  }, [])

  // Apply tabBar/navBar on mount
  useEffect(() => {
    switchTheme(themeKey)
  }, [])

  return { theme, themeKey, themeStyle, switchTheme, themes: THEMES }
}
