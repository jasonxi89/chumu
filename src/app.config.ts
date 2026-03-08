export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/bookings/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0a0a0a',
    navigationBarTitleText: '初慕',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#6b6560',
    selectedColor: '#e8a838',
    backgroundColor: '#0a0a0a',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/calendar/index', text: '日历' },
      { pagePath: 'pages/bookings/index', text: '预约' },
      { pagePath: 'pages/settings/index', text: '设置' },
    ],
  },
  cloud: true,
})
