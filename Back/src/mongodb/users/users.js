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
      name: String,
      roleDesc: String,
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
      const { _id = '' } = req.query;
      const { token } = req.signedCookies;
      const conditions = _id ? { _id } : { token }
      this.UserModel.find(conditions, { _id: 0, token: 0 }) // 第一个参数指定要过滤的某些参数，设置为0表示不暴露给api
        .then((doc) => {
          res.send({
            status: 0,
            result: doc.length ? doc[0] : [],
            msg: '查询用户信息成功'
          })
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
   * 获取所有的用户信息
   */
  GetAllUserAInfo() {
    this.app.get('/api/getAllUserInfo', (req, res, next) => {
      const { token } = req.signedCookies;
      this.UserModel.find({ token })
        .then((singleUser) => {
          const role = singleUser[0].role;
          // 过滤条件
          let filter = [];
          if (role === 'SUPERADMIN') {
            filter = [{ role: 'SUPERADMIN' }]
          }
          if (role === 'ADMIN') {
            filter = [{ role: 'SUPERADMIN' }, { role: 'ADMIN' }]
          }
          let { page = 1, size = 20, keyword = '', startTime = '', endTime = '', roleLevel = '' } = req.query;
          // 时间临界值处理
          startTime = startTime ? new Date(startTime + " 00:00:00") : null;
          endTime = endTime ? new Date(endTime + ' 23:59:59') : null;
          const conditions = {
            // 搜索条件的交集 $and
            $and: [
              {
                // 关键字模糊搜索
                $or: [
                  { name: { $regex: keyword, $options: '$i' } },
                  { mobile: { $regex: keyword, $options: '$i' } }
                ]
              }
            ]
          }
          // 添加时间段搜索
          if (startTime && endTime) {
            conditions.$and.push({ createdTime: {$gte: new Date(startTime), $lte: new Date(endTime)} })
          }

          if (roleLevel) {
            conditions.$and.push({ role: roleLevel })
          }
          this.UserModel.find(conditions, { token: 0, __v: 0 }) // 第一个参数指定要过滤的某些参数，设置为0表示不暴露给api
          .limit(Number.parseInt(size))
          .skip(Number.parseInt(page - 1) * size)
          .sort({createdTime: -1})
          .nor(filter)
          .then((doc) => {
            // 当前登录用户为超级管理员时，可以操作自身的数据
            if (role === 'SUPERADMIN') {
              doc.unshift(singleUser[0]);
            }
            res.send({
              status: 0,
              result: {
                list: doc,
                count: doc.length
              },
              msg: '查询用户信息成功'
            })
          })
          .catch((err) => {
            res.send({
              status: 400,
              result: err,
              msg: '查询用户信息失败'
            })
          })
        })
        .catch((err) => {
          res.send({
            result: err,
            status: 400,
            msg: '获取用户信息失败'
          })
        })
    });
  }

  /**
   * 更改单个用户信息 (根据 token 值)
   */
  UpdateSingleUserByToken() {
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
   * 更改单个用户信息 (根据 _id 值)
   */
  UpdateSingleUserById() {
    this.app.post('/api/updateSingleUserById', (req, res, next) => {
      const { _id, permission, role } = req.body;
      if (!_id || !permission || !role) {
        res.send({
          result: null,
          status: 400,
          msg: '参数不能为空'
        })
      } else {
        let roleDesc = null;
        switch (role) {
          case 'SUPERADMIN':
            roleDesc = '超级管理员';
            break;
          case 'ADMIN':
            roleDesc = '管理员';
            break;
          default:
            roleDesc = '普通用户';
            break;
        }
        this.UserModel.findByIdAndUpdate(_id, { permission, role, roleDesc })
          .then((doc) => {
            if (doc) {
              res.send({
                result: null,
                status: 0,
                msg: '数据更新成功'
              })
            } else {
              res.send({
                result: null,
                status: 400,
                msg: '数据更新失败'
              })
            }
          })
      }
    })
  }

  /**
   * 新增单个用户
   */
  AddSingleUser () {
    this.app.post('/api/addSingleUser', (req, res, next) => {
      const { account, password, name, role, mobile, avatar, permission } = req.body;
      if (!account || !password || !name || !role || !mobile || !avatar || !permission) {
        res.send({
          result: null,
          status: 400,
          msg: '参数不能为空'
        })
      } else {
        const token = account;
        const createdTime = Date.now();
        let roleDesc = null;
        switch (role) {
          case 'COMMON':
            roleDesc = '普通用户';
            break;
          case 'ADMIN':
            roleDesc = '管理员';
            break;
          case 'SUPERADMIN':
            roleDesc = '超级管理员';
            break;
          default:
            roleDesc = '';
            break;
        }
        const UserModel = this.UserModel;
        const addData = new UserModel({
          account, password, name, role, roleDesc, avatar, mobile, createdTime, permission, token
        })
        addData.save()
          .then((doc) => {
            if (doc) {
              res.send({
                result: null,
                status: 0,
                msg: '添加用户成功'
              })
            } else {
              res.send({
                result: err,
                status: 400,
                msg: '添加用户失败'
              })
            }
          })
          .catch((err) => {
            res.send({
              result: err,
              status: 400,
              msg: '添加用户出错'
            })
          })
      }
    })
  }

  /**
   * 根据 _id 删除单个用户
   */
  DeleteSingleUserById() {
    this.app.get('/api/deleteSingleUserById', (req, res, next) => {
      const { _id } = req.query;
      this.UserModel.findByIdAndDelete(_id)
        .then((doc) => {
          if (doc) {
            res.send({
              result: null,
              status: 0,
              msg: '删除用户成功'
            })
          } else {
            res.send({
              result: null,
              status: 400,
              msg: '删除用户失败'
            })
          }
        })
        .catch((err) => {
          res.send({
            result: err,
            status: 400,
            msg: '删除用户出错'
          })
        })
    })
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
    this.GetAllUserAInfo();
    this.UpdateSingleUserByToken();
    this.UpdateSingleUserById();
    this.AddSingleUser();
    this.DeleteSingleUserById();
    this.DeleteAliOssPhotos();
  }
}

const user = new USER();
user.Start();
