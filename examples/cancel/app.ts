import axios from '../../src/index'
import { Canceler } from '../../src'
const CancelToken = axios.CancelToken
const source = CancelToken.source()

// 第一种方法取消请求 通过静态方法
axios.get('/cancel/get', {
    cancelToken: source.token
}).catch(function (e) {
    console.log('Request canceled', e.message)
})

setTimeout(() => {
    source.cancel('Operation canceled by the user.')
    axios.post('/cancel/post', {
        a: 1
    }, {
        cancelToken: source.token
    }).catch(function (e) {
        if (axios.isCancel(e)) {
            console.log(e.message)
        }
    })
}, 100)

// 第二种方法取消请求 通过构造函数实例
let cancel: Canceler

axios.get('/cancel/get', {
    cancelToken: new CancelToken(c => {
        cancel = c
    })
}).catch(function (e) {
    if (axios.isCancel(e)) {
        console.log('Request canceled')
    }
})

setTimeout(() => {
    cancel()
}, 200)