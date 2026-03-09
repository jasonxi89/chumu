export interface Theme {
  key: string
  name: string
  vars: Record<string, string>
  tabBar: {
    color: string
    selectedColor: string
    backgroundColor: string
  }
  navBar: {
    backgroundColor: string
    textStyle: 'black' | 'white'
  }
}

export const THEMES: Theme[] = [
  {
    key: 'ink-gold',
    name: '墨金',
    vars: {
      '--color-bg': '#0a0a0a',
      '--color-bg-card': '#161616',
      '--color-bg-elevated': '#222222',
      '--color-bg-input': '#111111',
      '--color-text-primary': '#f5f0e8',
      '--color-text-secondary': '#a8a196',
      '--color-text-muted': '#6b6560',
      '--color-accent': '#e8a838',
      '--color-accent-light': 'rgba(232, 168, 56, 0.12)',
      '--color-accent-dark': '#c48a20',
      '--color-accent-glow': 'rgba(232, 168, 56, 0.25)',
      '--color-warning': '#e8a838',
      '--color-danger': '#e85454',
      '--color-success': '#4ade80',
      '--color-border': 'rgba(255, 255, 255, 0.06)',
      '--color-border-focus': 'rgba(232, 168, 56, 0.4)',
      '--shadow-card': '0 2px 16px rgba(0, 0, 0, 0.5)',
      '--shadow-elevated': '0 8px 40px rgba(0, 0, 0, 0.6)',
      '--shadow-glow': '0 4px 24px rgba(232, 168, 56, 0.25)',
    },
    tabBar: {
      color: '#6b6560',
      selectedColor: '#e8a838',
      backgroundColor: '#0a0a0a',
    },
    navBar: {
      backgroundColor: '#0a0a0a',
      textStyle: 'white',
    },
  },
  {
    key: 'peach',
    name: '蜜桃',
    vars: {
      '--color-bg': '#fef6f0',
      '--color-bg-card': '#ffffff',
      '--color-bg-elevated': '#fff0ec',
      '--color-bg-input': '#fdf8f6',
      '--color-text-primary': '#3d2c2c',
      '--color-text-secondary': '#9c8080',
      '--color-text-muted': '#c4a8a8',
      '--color-accent': '#e8728a',
      '--color-accent-light': 'rgba(232, 114, 138, 0.10)',
      '--color-accent-dark': '#d45a72',
      '--color-accent-glow': 'rgba(232, 114, 138, 0.20)',
      '--color-warning': '#f0a060',
      '--color-danger': '#e85454',
      '--color-success': '#5cb888',
      '--color-border': 'rgba(60, 40, 40, 0.08)',
      '--color-border-focus': 'rgba(232, 114, 138, 0.4)',
      '--shadow-card': '0 2px 16px rgba(100, 60, 60, 0.08)',
      '--shadow-elevated': '0 8px 32px rgba(100, 60, 60, 0.12)',
      '--shadow-glow': '0 4px 24px rgba(232, 114, 138, 0.20)',
    },
    tabBar: {
      color: '#c4a8a8',
      selectedColor: '#e8728a',
      backgroundColor: '#fef6f0',
    },
    navBar: {
      backgroundColor: '#fef6f0',
      textStyle: 'black',
    },
  },
]

export function getTheme(key: string): Theme {
  return THEMES.find(t => t.key === key) || THEMES[0]
}
