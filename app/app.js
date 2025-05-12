// 入口文件
// 引入 express 模块
const express = require('express')
// 引入 body-parser 模块
const bodyParser = require('body-parser')
// 引入 cors 模块
const cors = require('cors')

// 创建 express 实例
const app = express()
// 配置 cors 中间件
app.use(cors())
// 配置 body-parser 中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
