const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MYOSS = require('../../oss/oss');
const myOss = new MYOSS();

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

  /**
   * 登录接口
   */
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
                maxAge: 1000 * 60 * 60 * 2, signed: true
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

  /**
   * 查询单个用户信息
   */
  GetSingleUser() {
    this.app.get('/api/getSingleUser', (req, res, next) => {
      const { token } = req.signedCookies;
      this.UserModel.find({ token }, { _id: 0, token: 0 }) // 第一个参数指定要过滤的某些参数，设置为0表示不暴露给api
        .then((doc) => {
          if(!doc.length) {
            res.send({
              status: 400,
              result: null,
              msg: '找不到当前用户信息'
            })
          } else {
            res.send({
              status: 0,
              result: doc[0],
              msg: '查询用户信息成功'
            })
          }
        })
        .catch((err) => {
          res.send({
            status: 400,
            result: err,
            msg: '查询用户信息失败'
          })
        })
    });
  }

  /**
   * 更改单个用户信息
   */
  UpdateSingleUser() {
    this.app.post('/api/updateSingleUser', (req, res, next) => {
      const { account, password, name, avatar, mobile } = req.body;
      if (!account || !password || !name || !avatar || !mobile) {
        res.send({
          result: null,
          status: 400,
          msg: '参数不能为空'
        })
      } else {
        const { token } = req.signedCookies;
        this.UserModel.findOneAndUpdate({ token }, { account, password, name, avatar, mobile })
          .then((doc) => {
            res.send({
              result: null,
              status: 0,
              msg: '更新用户数据成功'
            })
          })
          .catch((err) => {
            res.send({
              result: null,
              status: 400,
              msg: '更新用户数据失败'
            })
          })
      }
    });
  }

  /**
   * 定时删除阿里云OSS对象上的多余图片文件（avatar 文件夹）
   */
  DeleteAliOssPhotos() {
    console.log('avatar 阿里云OSS checking____________________________________________');
    let timer = null;
    // 设置定时器
    timer = setInterval(() => {
    // 查找对应数据库获取当前正在用的所有图片地址
    this.UserModel.find({}).then((doc) => {
      let mongodbPhotos = '';
      doc.map((i) => {
        mongodbPhotos += i.avatar;
      });

      myOss.setBuckName('tanglihe-admin').then(() => {
        myOss.listDir('avatar/').then((result) => {
          const OssHasPhotos = [];
          if (result.objects && result.objects.length) {
            result.objects.forEach((obj) => {
              OssHasPhotos.push(obj.name);
            });
            
            const unExist = OssHasPhotos.filter((item) => !mongodbPhotos.includes(item));
            myOss.deleteMulti(unExist).then(() => {
              console.log('Dashboard 相关的多余图片已删除');
            })
          }
        })
      });
    });
    }, global.deleteOssPhotoTime);
  }

  Start() {
    this.GoLogin();
    this.GetSingleUser();
    this.UpdateSingleUser();
    this.DeleteAliOssPhotos();
  }
}

const user = new USER();
user.Start();
