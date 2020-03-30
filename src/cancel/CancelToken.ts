import { CancelExecutor, CancelTokenSource, Canceler } from "../types"
import Cancel from './Cancel'

interface ResolvePromise {
    (reason?: Cancel): void
}
export default class CancelToken {
    promise: Promise<Cancel>
    reason?: Cancel
    // executor参数是一个函数,他的参数也是一个函数
    constructor(executor: CancelExecutor) {
        let resolvePromise: ResolvePromise
        // 实例化Promise
        this.promise = new Promise<Cancel>(resolve => {
            resolvePromise = resolve
        })
        executor(message => {
            if (this.reason) {
                return
            }
            this.reason = new Cancel(message)
            resolvePromise(this.reason)
        })
    }
    throwIfRequested() {
        if (this.reason) {
            throw this.reason
        }
    }
    // 实现类类型中的 静态方法
    static source(): CancelTokenSource {
        let cancel!: Canceler
        // 实例化CancelToken
        const token = new CancelToken(c => {
            cancel = c
        })
        return {
            cancel,
            token
        }
    }
}