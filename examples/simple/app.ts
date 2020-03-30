import axios from '../../src/index'

axios({
    method: 'get',
    url: '/simple/get/1',
    params: {
        a: 1,
        b: 2
    }
})