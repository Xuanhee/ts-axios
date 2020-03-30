const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')
const path = require('path')
const atob = require('atob')
require('./server2')

const app = express()
const compiler = webpack(WebpackConfig)

app.use(webpackDevMiddleware(compiler, {
  publicPath: '/__build__/',
  stats: {
    colors: true,
    chunks: false
  }
}))
app.use(webpackHotMiddleware(compiler))

// app.use(express.static(__dirname))
app.use(express.static(__dirname, {
  setHeaders(res) {
    res.cookie('XSRF-TOKEN-D', '1234abc')
  }
}))

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cookieParser())

const multipart = require('connect-multiparty')
app.use(multipart({
  uploadDir: path.resolve(__dirname, 'upload-file')
}))


registerSimpleRouter()
registerBaseRouter()
registerErrorRouter()
registerExtendRouter()
registerInterceptorRouter()
registerConfigRouter()
registerCancelRouter()
registerMoreRouter()

const port = process.env.PORT || 8080
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port},Ctrl+C to stop`);
})

function registerSimpleRouter() {
  // const router = express.Router()
  app.get('/simple/get/1', (req, res) => {
    res.json({
      msg: 'hello world'
    })
  })
  // app.use(router)
}

function registerBaseRouter() {
  app.get('/base/get', (req, res) => {
    res.json(req.query)
  })

  app.post('/base/post', (req, res) => {
    res.json(req.body)
  })
  app.post('/base/buffer', (req, res) => {
    let msg = []
    req.on('data', (chunk) => {
      if (chunk) {
        msg.push(chunk)
      }
    })
    req.on('end', () => {
      let buf = Buffer.concat(msg)
      res.json(buf.toJSON())
    })
  })
}

function registerErrorRouter() {
  app.get('/error/get', (req, res) => {
    if (Math.random() > 0.5) {
      res.json({
        msg: `hello world`
      })
    } else {
      res.status(500)
      res.end()
    }
  })

  app.get('/error/timeout', (req, res) => {
    setTimeout(() => {
      res.json({
        msg: `hello world`
      })
    }, 3000)
  })

}
// 扩展功能
function registerExtendRouter() {
  app.get('/extend/get', (req, res) => {
    res.json({
      msg: 'hello world'
    })
  })
  app.options('/extend/options', (req, res) => {
    res.end()
  })
  app.delete('/extend/delete', (req, res) => {
    res.end()
  })
  app.head('/extend/head', (req, res) => {
    res.end()
  })
  app.post('/extend/post', (req, res) => {
    res.json(req.body)
  })
  app.put('/extend/put', (req, res) => {
    res.json(req.body)
  })
  app.patch('/extend/patch', (req, res) => {
    res.json(req.body)
  })
  app.get('/extend/user', ((req, res) => {
    res.json({
      code: 0,
      message: 'ok',
      result: {
        name: 'jack',
        age: 18
      }
    })
  }))
}
// 拦截器
function registerInterceptorRouter() {
  app.get('/interceptor/get', (req, res) => {
    res.end('hello')
  })
}
// defaults默认配置属性
function registerConfigRouter() {
  app.post('/config/post', (req, res) => {
    res.json(req.body)
  })
}
// 取消请求
function registerCancelRouter() {
  app.get('/cancel/get', (req, res) => {
    setTimeout(() => {
      res.json('hello')
    }, 1000)
  })
  app.post('/cancel/post', (req, res) => {
    setTimeout(() => {
      res.json(req.body)
    }, 1000)
  })
}

// 携带cookie
function registerMoreRouter() {
  app.get('/more/get', (req, res) => {
    res.json(req.cookies)
  })
  app.post('/more/upload', function (req, res) {
    console.log(req.body, req.files)
    res.end('upload success!')
  })
  app.post('/more/post', (req, res) => {
    const auth = req.headers.authorization
    const [type, credentials] = auth.split(' ')
    console.log(atob(credentials))
    const [username, password] = atob(credentials).split(':')
    if (type === 'Basic' && username === 'Yee' && password === '123456') {
      res.json(req.body)
    } else {
      res.status(401)
      res.end('UnAuthorization')
    }
  })

  app.get('/more/304', (req, res) => {
    res.status(304)
    res.end()
  })

  app.get('/more/A', (req, res) => {
    res.end('A')
  })

  app.get('/more/B', (req, res) => {
    res.end('B')
  })
}
