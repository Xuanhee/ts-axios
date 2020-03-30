import { AxiosRequestConfig } from './types'
import { transformResponse, transformRequest } from './helpers/data'
import { processHeaders } from './helpers/headers'

// 定义defaults对象属性  默认值
const defaults: AxiosRequestConfig = {
    method: 'get',
    timeout: 0,
    headers: {
        // 让所有的请求都有accept这个属性
        common: {
            Accept: 'application/json,text/plain,*/*'
        }
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    // 默认不传入headers的情况下,也要设置content-type 可以让headers为一个空对象 始终都会有一个content-type属性
    transformRequest: [
        function (data: any, headers: any): any {
            // 在默认对象中修改data的类型和 headers的content - type
            processHeaders(headers, data)
            // 处理data
            return transformRequest(data)
        }
    ],
    transformResponse: [
        function (data: any): any {
            return transformResponse(data)
        }
    ],
    // 合法区间状态码
    validateStatus(status: number): boolean {
        return status >= 200 && status < 300
    }
}
// 没有data属性的请求方式
const methodsNoData = ['get', 'delete', 'head', 'options']
methodsNoData.forEach(method => {
    defaults.headers[method] = {}
})
// 带有data的请求方式 设置默认的headers
const methodsWithData = ['put', 'post', 'patch']
methodsWithData.forEach(method => {
    defaults.headers[method] = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

export default defaults