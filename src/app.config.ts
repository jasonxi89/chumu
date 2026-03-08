export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/bookings/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTitleText: '初慕',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#34d399',
    backgroundColor: '#0f172a',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/calendar/index', text: '日历' },
      { pagePath: 'pages/bookings/index', text: '预约' },
      { pagePath: 'pages/settings/index', text: '设置' },
    ],
  },
  cloud: true,
})
