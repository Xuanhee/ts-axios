import { AxiosRequestConfig, AxiosResponse } from '../types'
// 错误类型的类 自定义一些属性同时继承Error类
export class AxiosError extends Error {
    isAxiosError: boolean
    config: AxiosRequestConfig
    code?: string | null
    request?: any
    response?: AxiosResponse

    /* istanbul ignore next */
    constructor(
        message: string,
        config: AxiosRequestConfig,
        code?: string | null,
        request?: any,
        response?: AxiosResponse
    ) {
        super(message)
        this.config = config
        this.code = code
        this.request = request
        this.response = response
        this.isAxiosError = true
        // 当一个类继承Error类时，内置对象Error，Array，Map等会有问题，调用不到  以下代码可以解决这个坑
        Object.setPrototypeOf(this, AxiosError.prototype)
    }
}
// 利用工厂函数创建Error 这样的话外部调用createError方法就可以拿到AxiosError的实例, 不需要去new了,直接调用这个工厂函数就可以拿到error实例
export function createError(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    request?: any,
    response?: AxiosResponse) {
    const error = new AxiosError(message, config, code, request, response)
    return error
}