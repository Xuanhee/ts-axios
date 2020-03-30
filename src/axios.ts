import { AxiosStatic, AxiosRequestConfig } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'



// 创建一个工厂函数创建 axios实例
function createInstance(config: AxiosRequestConfig): AxiosStatic {
    // 创建一个Axios 实例, 这个实例中有扩展的所有方法
    const context = new Axios(config)
    // 但是还要保持原始方法 axios({}) 这种直接调用方式, 将方法的对象指向 Axios的实例对象,外部调用也可以使用此方法
    const instance = Axios.prototype.request.bind(context)
    // const instance = context.request
    extend(instance, context)
    return instance as AxiosStatic
}
const axios = createInstance(defaults)
// 当外部调用create方法的时候 内部会调用createInstance方法,创建一个新的axios实例，并且通过mergeConfig将 传入的配置和defaults的配置合并
axios.create = function create(config) {
    return createInstance(mergeConfig(defaults, config))
}
axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

// axios.all这个方法其实就是promise.all
axios.all = function all(promises) {
    return Promise.all(promises)
}
// spread方法相当于就是给回调函数的参数用数组的解构赋值  不用这个方法,直接then(([a,b])) 对参数解构就可以拿到对应的 all中的返回值
axios.spread = function spread(callback) {
    return function wrap(arr) {
        return callback.apply(null, arr)
    }
}
axios.Axios = Axios

export default axios