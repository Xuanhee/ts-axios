import axios from '../../src/index'

axios({
    url: '/extend/post',
    method: 'post',
    data: {
        msg: 'hi'
    }
})

axios.request({
    url: '/extend/post',
    method: 'post',
    data: {
        msg: 'hello'
    }
})

axios.get('/extend/get')

axios.options('/extend/options')

axios.delete('/extend/delete')

axios.head('/extend/head')

axios.post('/extend/post', { msg: 'post' })

axios.put('/extend/put', { msg: 'put' })

axios.patch('/extend/patch', { msg: 'patch' })


axios({
    url: '/extend/post',
    method: 'post',
    data: {
        msg: 'hi hi'
    }
})

axios('/extend/post', {
    method: 'post',
    data: {
        msg: 'hello hi'
    }
})

interface ResponseData<T = any> {
    code: number
    result: T
    message: string
}
interface User {
    name: string
    age: number
}
// 定义一个方法,方法接收一个泛型类型, 主要是做类型推导用
function getUser<T>() {
    return axios<ResponseData<T>>('/extend/user')
        .then(res => res.data)
        .catch(err => console.log(err))
}

async function test() {
    const user = await getUser<User>()
    if (user) {
        console.log(user.result.name)
    }
}
test()