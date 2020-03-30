// 公用部分组件

import axios from ".."

// 用字符串字面量类型 type声明定义请求方式
export type Method = 'get' | 'GET' |
    'post' | 'POST' |
    'put' | 'PUT' |
    'delete' | 'DELETE' |
    'options' | 'OPTIONS' |
    'head' | 'HEAD' |
    'patch' | 'PATCH'

// axios的请求参数 类型
export interface AxiosRequestConfig {
    url?: string
    method?: Method
    data?: any
    params?: any
    headers?: any
    responseType?: XMLHttpRequestResponseType
    timeout?: number
    transformRequest?: AxiosTransformer | AxiosTransformer[]
    transformResponse?: AxiosTransformer | AxiosTransformer[]
    cancelToken?: CancelToken
    withCredentials?: boolean
    xsrfCookieName?: string
    xsrfHeaderName?: string
    onDownloadProgress?: (e: ProgressEvent) => void
    onUploadProgress?: (e: ProgressEvent) => void
    auth?: AxiosBasicCredentials
    validateStatus?: (status: number) => boolean
    paramsSerializer?: (params: any) => string
    baseURL?: string
    // 字符串索引签名
    [propName: string]: any
}

// 响应参数类型   添加一个泛型,默认为any类型的 加泛型的目的就是请求什么类型,响应什么类型
export interface AxiosResponse<T = any> {
    data: T,
    status: number,
    statusText: string,
    headers: any,
    config: AxiosRequestConfig,
    request: any
}

// axios函数返回的对象类型
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {

}

// 错误类型接口 作用是给开发者提供出去可以判断错误类型而使用
export interface AxiosError extends Error {
    isAxiosError: boolean
    config: AxiosRequestConfig
    code?: string | null
    request?: any
    response?: AxiosResponse
}

// 扩展axios接口类型,添加一些方法
export interface Axios {
    defaults: AxiosRequestConfig
    interceptors: {
        request: AxiosInterceptionManage<AxiosRequestConfig>
        response: AxiosInterceptionManage<AxiosResponse>
    }
    request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>
    get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
    delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
    head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
    options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
    getUri(config?: AxiosRequestConfig): string
}
// 混合类型的接口定义, 接口内部()这种写法表示本身就是一个函数 
// 然后继承上面的函数接口,构成一个混合函数 调用此接口判断的类型是自己既是一个函数,同时又很很多的函数的方法
export interface AxiosInstance extends Axios {
    // 函数类型定义  函数重载的方式做类型定义
    <T = any>(config: AxiosRequestConfig): AxiosPromise<T>
    <T = any>(url: string, config?: any): AxiosPromise<T>
}
// 类类型
export interface AxiosClassStatic {
    // 返回值就是一个实例类型
    new(config: AxiosRequestConfig): Axios
}
// 定义一个create接口, 该接口含有一个create方法
export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance
    CancelToken: CancelTokenStatic
    Cancel: CancelStatic
    isCancel: (value: any) => boolean
    all<T>(promise: Array<T | Promise<T>>): Promise<T[]>
    spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R

    Axios: AxiosClassStatic
}
// 定义拦截器对外的接口
export interface AxiosInterceptionManage<T> {
    // 定义use函数, 函数内两个参数也是函数类型
    use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number
    // eject函数是根据一个id删除一个拦截器
    eject(id: number): void
}
export interface ResolvedFn<T> {
    (val: T): T | Promise<T>
}
export interface RejectedFn {
    (error: any): any
}
export interface AxiosTransformer {
    (data: any, headers?: any): any
}
// 实例类型
export interface CancelToken {
    promise: Promise<Cancel>
    reason?: Cancel

    throwIfRequested(): void
}
// 取消方法接口
export interface Canceler {
    (message?: string): void
}
// 传给CancelToken构造函数的参数类型
export interface CancelExecutor {
    (cancel: Canceler): void
}

export interface CancelTokenSource {
    token: CancelToken
    cancel: Canceler
}
// cancelToken 的类类型
export interface CancelTokenStatic {
    // 构造函数方法定义
    new(executor: CancelExecutor): CancelToken
    // 静态方法定义
    source(): CancelTokenSource
}

export interface Cancel {
    message?: string
}
// 类类型
export interface CancelStatic {
    new(message?: string): Cancel
}

// auth对象的类型
export interface AxiosBasicCredentials {
    username: string
    password: string
}