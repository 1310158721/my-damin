const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class USER {
  constructor() {
    this.app = global.APP;
    this.db = mongoose.createConnection(
      `mongodb://127.0.0.1:${global.mongoPort}/allUser`,
      { useUnifiedTopology: true, useNewUrlParser: true }
    );

    // 用户数据结构 Schema
    this.UserSchema = new Schema({
      account: String,
      password: String,
      mobile: String,
      avatar: String,
      permission: String,
      desc: String,
      token: String,
      role: String,
      username: String,
      createdTime: Number
    });

    this.UserModel = this.db.model('user_list', this.UserSchema);
  }

  // 登录接口
  GoLogin() {
    this.app.get('/api/login', (req, res, next) => {
      const { account, password } = req.query;
      if (!account || !password) {
        res.send({
          result: null,
          status: 400,
          msg: '请输入账号和密码'
        });
      } else {
        this.UserModel.find({ account, password })
          .then(doc => {
            if (!doc.length) {
              res.send({
                result: null,
                status: 400,
                msg: '暂无该用户，请前往注册'
              });
            } else if (doc.length === 1) {
              const { token } = doc[0];
              // cookie 有效期 2h
              res.cookie('token', token, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 2)
              });

              res.send({
                result: null,
                status: 0,
                msg: '登录成功'
              });
            } else {
              res.send({
                result: null,
                status: 400,
                msg: '后台数据存在两个以上的该用户，前管理员前往处理'
              });
            }
          })
          .catch(err => {
            console.log('error');
          });
      }
    });
  }

  Start() {
    this.GoLogin();
  }
}

const user = new USER();
user.Start();
