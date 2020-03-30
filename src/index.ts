import axios from './axios'
// 将所有的接口暴露出去,这样调用者既可以使用axios,还可以使用类型判断
export * from './types'
export default axios