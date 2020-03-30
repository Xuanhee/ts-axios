import { ResolvedFn, RejectedFn } from '../types'
// 定义内部接口 当前类中使用
interface Interceptor<T> {
    resolved: ResolvedFn<T>
    rejected?: RejectedFn
}
export default class InterceptionManager<T> {
    // 私有属性存储拦截器  数组类型的 或者是数组类型的null
    private interceptors: Array<Interceptor<T> | null>
    // 在构造器中初始化拦截器
    constructor() {
        this.interceptors = []
    }
    use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
        this.interceptors.push({
            resolved,
            rejected
        })
        // 返回当前拦截器的索引
        return this.interceptors.length - 1
    }
    // eject函数就是删除已有拦截器的 通过id 也就是拦截器索引
    eject(id: number): void {
        // 如果查到这个拦截器,就删除他
        if (this.interceptors[id]) {
            this.interceptors[id] = null
        }
    }
    // 提供一个外部可以访问的forEach 方法  这个函数的作用只是对interceptors做遍历 因为interceptors是私有属性,所以只能在内部操作
    forEach(fn: (interceptor: Interceptor<T>) => void): void {
        this.interceptors.forEach((interceptor) => {
            // 将所有不为null的拦截器都作为fn的参数执行一遍
            if (interceptor !== null) {
                fn(interceptor)
            }
        })
    }
}