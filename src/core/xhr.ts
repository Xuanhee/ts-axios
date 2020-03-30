import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import { isFormData } from '../helpers/util'
import cookie from '../helpers/cookie'
// 定义传入参数的类型是 AxiosRequestConfig  返回一个Promise类型
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        // 通过解构拿到变量  不传值的话默认是get请求 data默认为null send只有在post或者put情况下才会有data值
        const { url, data = null, method, headers = {}, responseType, timeout, cancelToken,
            withCredentials, xsrfCookieName, xsrfHeaderName, onDownloadProgress, onUploadProgress,
            auth, validateStatus } = config
        // 1.首先实例化
        const request = new XMLHttpRequest()
        // 2.调用open方法初始化. true表示是异步的
        request.open(method!.toUpperCase(), url!, true)
        // 3.配置request对象
        configRequest()
        // 4.给request.添加一些事件处理函数
        addEvents()
        // 5.处理请求headers
        processHeaders()
        // 6.处理请求取消逻辑
        processCancel()
        // 7.发送请求
        request.send(data)


        // 配置相关的代码封装
        function configRequest(): void {
            // 如果设置了responseType那么就添加
            if (responseType) {
                request.responseType = responseType
            }
            // 如果设置了超时时间,那么就添加tiemout
            if (timeout) {
                request.timeout = timeout
            }
            // 如果withCredentials 为true 那么表示携带cookies
            if (withCredentials) {
                request.withCredentials = withCredentials
            }
            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress
            }
            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress
            }
        }
        // 封装事件处理函数
        function addEvents(): void {
            // 监听代理改变事件 对响应结果的处理
            request.onreadystatechange = function handleLoad() {
                if (request.readyState !== 4) {
                    return
                }
                // 网络错误或者超时错误 status是0
                if (request.status === 0) {
                    return
                }
                // 当下载操作完成时 获取所有响应头数据  同时要解析响应头数据, 默认的响应头数据是由\r\n 分隔开的一行一行的大字符串
                // 通过parseHeaders函数解析成对象
                const responseHeaders = parseHeaders(request.getAllResponseHeaders())
                // 响应的数据,如果响应类型不是text那就传入啥类型返回啥类型,否则就是text类型的相应数据
                const responseData = responseType && responseType !== 'text' ? request.response : request.responseText
                const response: AxiosResponse = {
                    // 返回的数据
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    // 响应头
                    headers: responseHeaders,
                    // 请求参数
                    config,
                    // 请求的实例
                    request
                }
                // 对正常情况和异常情况都做处理
                handleResponse(response)
            }

            // 监听网络错误事件
            request.onerror = function handleError() {
                // 错误请求,不会返回response.所以不用传入
                reject(createError('Network Error', config, null, request))
            }
            // 监听超时事件
            request.ontimeout = function handleTimeout() {
                // ECONNABORTED 表示被终止 同样,不会返回response.所以不用传入
                reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
            }
        }
        // 封装处理headers的函数
        function processHeaders(): void {
            if (isFormData(data)) {
                delete headers['Content-Type']
            }
            // 判断是否携带cookie的属性为true 或者是同源，那么就携带cookie
            if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
                const xsrfValue = cookie.read(xsrfCookieName)
                if (xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName] = xsrfValue
                }
            }
            if (auth) {
                headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
            }
            // 如果是post请求则必须要设置headers的 content-type
            // 可以判断data数据是否存在,如果data不存在可以不设置content-type
            Object.keys(headers).forEach((name) => {
                // 没有data就不需要content-type这个属性了
                if (data === null && name.toLowerCase() === 'content-type') {
                    // 删除content-type
                    delete headers[name]
                } else {
                    // 正常设置请求头
                    request.setRequestHeader(name, headers[name])
                }

            })
        }
        // 封装 取消请求的处理函数
        function processCancel(): void {
            // 如果有cancelToken这个配置 那么就取消请求,并发出一个错误
            if (cancelToken) {
                cancelToken.promise.then(reason => {
                    request.abort()
                    reject(reason)
                }).catch(
                    /* istanbul ignore next */
                    () => {
                        // do nothing
                    })
            }
        }
        // 封装响应参数判断函数, 如果请求时成功的那么返回成功请求,否则reject  错误语句
        function handleResponse(response: AxiosResponse): void {
            // 默认的validateStatus是 200-300之间, 用户如果没有设置或者设置的值在这个区间,那就是正常的
            if (!validateStatus || validateStatus(response.status)) {
                resolve(response)
            } else {
                reject(createError(`Request failed with status code ${response.status}`, config, null, request, response))
            }
        }
    })
} 