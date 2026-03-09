export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/bookings/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#fef6f0',
    navigationBarTitleText: '初慕',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#c4a8a8',
    selectedColor: '#e8728a',
    backgroundColor: '#fef6f0',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/calendar/index', text: '日历' },
      { pagePath: 'pages/bookings/index', text: '预约' },
      { pagePath: 'pages/settings/index', text: '设置' },
    ],
  },
  cloud: true,
})
