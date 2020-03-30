import { AxiosTransformer } from "../types";

// 请求和响应的配置化
export default function transform(data: any, headers: any, fns?: AxiosTransformer | AxiosTransformer[]): any {
    if (!fns) {
        return
    }
    // 如果fns不是数组就变成数组,方便统一处理
    if (!Array.isArray(fns)) {
        fns = [fns]
    }
    // 管道式 链式调用的方式,循环处理fns 将data循环赋值,最后拿到最后的data
    fns.forEach(fn => {
        data = fn(data, headers)
    })
    return data
}