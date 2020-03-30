import axios, { AxiosRequestConfig, AxiosResponse } from '../src/index'
import { getAjaxRequest } from './helper'

describe('interceptors', () => {
    beforeEach(() => {
        jasmine.Ajax.install()
    })
    afterEach(() => {
        jasmine.Ajax.uninstall()
    })

    test('should add a request interceptor', () => {
        const instance = axios.create()
        instance.interceptors.request.use((config: AxiosRequestConfig) => {
            config.headers.test = 'added by interceptor'
            return config
        })

        instance('/foo')

        return getAjaxRequest().then(request => {
            expect(request.requestHeaders.test).toBe('added by interceptor')
        })
    })

    test('should add a request interceptor that returns a new config object', () => {
        const instance = axios.create()
        instance.interceptors.request.use(() => {
            return {
                url: '/bar',
                method: 'post'
            }
        })

        instance('/foo')

        return getAjaxRequest().then(request => {
            expect(request.method).toBe('POST')
            expect(request.url).toBe('/bar')
        })
    })

    test('should add a request interceptor that returns a promise', done => {
        const instance = axios.create()
        instance.interceptors.request.use((config: AxiosRequestConfig) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    config.headers.async = 'promise'
                    resolve(config)
                }, 10)
            })
        })
        instance('/foo')

        setTimeout(() => {
            getAjaxRequest().then(request => {
                expect(request.requestHeaders.async).toBe('promise')
                done()
            })
        }, 100)
    })

    test('should add multiple request interceptors', () => {
        const instance = axios.create()
        instance.interceptors.request.use(config => {
            config.headers.test1 = '1'
            return config
        })
        instance.interceptors.request.use(config => {
            config.headers.test2 = '2'
            return config
        })
        instance.interceptors.request.use(config => {
            config.headers.test3 = '3'
            return config
        })
        instance('/foo')
        return getAjaxRequest().then(request => {
            expect(request.requestHeaders.test1).toBe('1')
            expect(request.requestHeaders.test2).toBe('2')
            expect(request.requestHeaders.test3).toBe('3')
        })
    })

    test('should add a response interceptors', done => {
        let response: AxiosResponse
        const instance = axios.create()

        instance.interceptors.response.use(response => {
            response.data = response.data + ' - modified by interceptor'
            return response
        })
        instance('/foo').then(res => {
            response = res
        })
        getAjaxRequest().then(request => {
            request.respondWith({
                status: 200,
                responseText: 'OK'
            })
        })
        setTimeout(() => {
            expect(response.data).toBe('OK - modified by interceptor')
            done()
        })
    })

    test('should add a response interceptor that returns a new data object', done => {
        let response: AxiosResponse
        const instance = axios.create()

        instance.interceptors.response.use(() => {
            return {
                data: 'stuff',
                headers: null,
                status: 500,
                statusText: 'ERR',
                request: null,
                config: {}
            }
        })
        instance('/foo').then(res => {
            response = res
        })

        getAjaxRequest().then(request => {
            request.respondWith({
                status: 200,
                responseText: 'OK'
            })

            setTimeout(() => {
                expect(response.data).toBe('stuff')
                expect(response.headers).toBeNull()
                expect(response.status).toBe(500)
                expect(response.statusText).toBe('ERR')
                expect(response.request).toBeNull()
                expect(response.config).toEqual({})
                done()
            }, 100)
        })
    })

    test('should add a response interceptor that returns a promise', done => {
        let response: AxiosResponse
        const instance = axios.create()

        instance.interceptors.response.use(response => {
            return new Promise(resolve => {
                setTimeout(() => {
                    response.data = 'you have been promise'
                    resolve(response)
                }, 10)
            })
        })
        instance('/foo').then(res => {
            response = res
        })

        getAjaxRequest().then(request => {
            request.respondWith({
                status: 200
            })
        })

        setTimeout(() => {
            expect(response.data).toBe('you have been promise')
            done()
        }, 100)
    })

    test('should add multiple response interceptors', done => {
        let response: AxiosResponse
        const instance = axios.create()

        instance.interceptors.response.use((response) => {
            response.data = response.data + '1'
            return response
        })
        instance.interceptors.response.use((response) => {
            response.data = response.data + '2'
            return response
        })
        instance.interceptors.response.use((response) => {
            response.data = response.data + '3'
            return response
        })

        instance('/foo').then(res => {
            response = res
        })

        getAjaxRequest().then(request => {
            request.respondWith({
                status: 200,
                responseText: 'OK'
            })
        })
        setTimeout(() => {
            expect(response.data).toBe('OK123')
            done()
        }, 100)
    })

    test('should allow remove interceptors', done => {
        let response: AxiosResponse
        let intercept
        const instance = axios.create()

        instance.interceptors.response.use((response) => {
            response.data = response.data + '1'
            return response
        })
        intercept = instance.interceptors.response.use((response) => {
            response.data = response.data + '2'
            return response
        })
        instance.interceptors.response.use((response) => {
            response.data = response.data + '3'
            return response
        })

        instance.interceptors.response.eject(intercept)
        instance.interceptors.response.eject(5)
        instance('/foo').then(res => {
            response = res
        })

        getAjaxRequest().then(request => {
            request.respondWith({
                status: 200,
                responseText: 'OK'
            })
        })
        setTimeout(() => {
            expect(response.data).toBe('OK13')
            done()
        }, 100)
    })
})