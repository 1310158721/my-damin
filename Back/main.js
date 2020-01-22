// 导入相关配置文件
require('./src/configs');
const express = require('express');
const app = express();
// 将app绑定到全局变量中
global.APP = app;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// 支持 post 请求在 req.body 中获取 request payload 的参数
app.use(bodyParser.json());
// 支持前端调取接口时，后端能拿到浏览器的cookie
app.use(cookieParser('admin')); // cookieParser 加密 token
// express 静态托管资源
app.use(express.static('./'));
// app.use(express.static('./dist/'));
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 全局拦截所有请求，做相关的操作
app.all('*', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return false;
  }
  
  // 支持跨域
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  
  next();
});

// 连接数据库 adminAllUser
mongoose.connect(`mongodb://127.0.0.1:${global.mongoPort}/allUser`, { useNewUrlParser: true });

// 保存 mongodb 连接状态
const db = mongoose.connection;
// 监听连接数据库成功状态
db.on('connected', () => {
  console.log('MongoDB 连接成功!!!');
});

// 监听连接数据库失败状态
db.on('error', () => {
  console.log('MongoDB 连接失败!!!');
});

// 监听连接数据库断开状态
db.on('disconnected', () => {
  console.log('MongoDB 断开连接!!!');
});

// 导入相关接口
require('./src/mongodb');
require('./src/upload/upload');

// 应用监听端口
app.listen(9000, () => {
  console.log('server is running at http://127.0.0.1:9000/');
});
