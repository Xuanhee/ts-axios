import { AxiosRequestConfig, AxiosPromise, AxiosResponse, Method, ResolvedFn, RejectedFn } from '../types'
import dispatchRequest, { transformUrl } from './dispatchRequest'
import InterceptorsManager from './InterceptionManager'
import mergeConfig from './mergeConfig'
// 内部定义接口 request 和response 两个属性
interface Interceptors {
    request: InterceptorsManager<AxiosRequestConfig>
    response: InterceptorsManager<AxiosResponse>
}
// 链式调用的类型
interface PromiseChain<T> {
    resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
    rejected?: RejectedFn
}
// Axios类, 类中拓展了很多方法 ,get.post等
export default class Axios {
    defaults: AxiosRequestConfig
    interceptors: Interceptors
    constructor(initConfig: AxiosRequestConfig) {
        // 初始化默认属性的值
        this.defaults = initConfig
        // 这个属性是一个对象,对象内有两个值
        this.interceptors = {
            // 请求拦截器
            request: new InterceptorsManager<AxiosRequestConfig>(),
            // 响应拦截器
            response: new InterceptorsManager<AxiosResponse>()
        }
    }
    // request 函数,实际上就是原始的发送请求的函数 只不过是调用了request这个方法
    request(url: any, config?: any): AxiosPromise {
        if (typeof url === 'string') {
            // 传入url 然后判断config是否传入
            if (!config) {
                config = {}
            }
            // 然后赋值传入的url
            config.url = url
        } else {
            // 如果没有传入url,那么就默认是一个参数
            config = url
        }
        // 发送请求拿到config后合并请求配置
        config = mergeConfig(this.defaults, config)
        config.method = config.method.toLowerCase()
        // 链式调用逻辑 初始值就是发送的请求
        const chain: PromiseChain<any>[] = [{
            resolved: dispatchRequest,
            rejected: undefined
        }]
        // 请求拦截器,后添加的先执行
        this.interceptors.request.forEach((interceptor) => {
            chain.unshift(interceptor)
        })
        // 响应拦截器,先添加的先执行
        this.interceptors.response.forEach((interceptor) => {
            chain.push(interceptor)
        })
        let promise = Promise.resolve(config)
        while (chain.length) {
            // 解构拿到chain中的 resolved 和 rejected
            const { resolved, rejected } = chain.shift()!
            promise = promise.then(resolved, rejected)
        }
        return promise
    }
    get(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('get', url, config)
    }
    delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('delete', url, config)
    }
    head(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('head', url, config)
    }
    options(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('options', url, config)
    }

    // 多一个data的请求方式 就是在参数中多添加一个data
    post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('post', url, data, config)
    }
    put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('put', url, data, config)
    }
    patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('patch', url, data, config)
    }
    getUri(config?: AxiosRequestConfig): string {
        config = mergeConfig(this.defaults, config)
        return transformUrl(config)
    }
    // 封装发送请求的方法,接收不同的请求方式,发送不同的请求  通过浅拷贝Object.assign的方法 更改一些数据
    _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this.request(Object.assign(config || {}, {
            method,
            url
        }))
    }
    // 伴随data的请求 和上面那个函数的区别就是多扩展一个data的属性，data属性属于post put等的请求
    _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this.request(Object.assign(config || {}, {
            method,
            url,
            data
        }))
    }
}