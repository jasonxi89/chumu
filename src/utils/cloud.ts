import Taro from '@tarojs/taro'

let initialized = false

export function initCloud() {
  if (initialized) return
  if (Taro.cloud) {
    Taro.cloud.init({
      env: 'cloudbase-6ghifx17984493dd',
      traceUser: true,
    })
    initialized = true
  }
}

export function getDB() {
  initCloud()
  return Taro.cloud.database()
}

export function getCollection(name: string) {
  return getDB().collection(name)
}
