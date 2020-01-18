const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class MENU {
  constructor() {
    this.app = global.APP;
    this.db = mongoose.createConnection(
      `mongodb://127.0.0.1:${global.mongoPort}/allUser`,
      { useUnifiedTopology: true, useNewUrlParser: true }
    );

    // 导航菜单数据结构 Schema
    this.MenuListSchema = new Schema({
      title: String,
      disabled: Boolean,
      children: Array,
      icon: String,
      permission: String
    });

    // 导航菜单数据 Model
    this.MenuListModel = this.db.model('menu_list', this.MenuListSchema);

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
      createdTime: Number
    });

    // 用户数据 Model(表的名称不能大写)
    this.UserModel = this.db.model('user_list', this.UserSchema);
  }

  /**
   * 删除没有权限值的导航菜单
   * @param {已有的权限} hasPermission 
   * @param {权限列表} list 
   */
  loopMatchList (hasPermission, list) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (!list[i].children || !list[i].children.length) {
        if (!hasPermission.includes(list[i].permission)) {
          list.splice(i, 1);
        }
      } else {
        this.loopMatchList(hasPermission, list[i].children);
      }
    }
  }

  /**
   * 多次遍历删除空数组
   * @param {权限列表} list 
   */
  delEmptyArray (list) {
    for (let t = 0; t < 3; t++) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].children !== null) {
          if (!list[i].children.length) {
            list.splice(i, 1);
          } else {
            this.delEmptyArray(list[i].children);
          }
        }
      }
    }
  }

  /**
   * 获取菜单栏所有项
   */
  getAllMenuItem() {
    this.app.get('/api/getAllMenuItem', (req, res, next) => {
      this.MenuListModel.find()
        .then((doc) => {
          if (!doc.length) {
            res.send({
              result: null,
              status: 0,
              msg: '获取菜单栏所有项失败'
            })
          } else{
            res.send({
              result: doc,
              status: 0,
              msg: '获取菜单栏所有数据成功'
            })
          }
        })
    })
  }

  /**
   * 获取单个用户权限菜单菜单栏接口
   */
  getMenuList() {
    this.app.get('/api/getMenuList', (req, res, next) => {
      const { roleId, inside } = req.query;
      const { token } = req.cookies;
      const params = roleId ? { _id: roleId } : { token };
      this.UserModel.find(params)
        .then((doc) => {
          if (!doc.length) {
            res.send({
              result: null,
              status: 0,
              msg: '暂无该用户信息'
            })
          } else {
            const { username, desc, permission, role, avatar, mobile, password, account } = doc[0];
            const hasPermission = permission.split(',');
            this.MenuListModel
              .find({})
              .sort({ order: 1 })
              .then((list) => {
                if (!inside) {
                  this.loopMatchList(hasPermission, list);
                  this.delEmptyArray(list);
                }
                const result = inside ? Object.assign({}, { list, username, desc, role, permission: permission ? permission.split(',') : [], avatar, mobile, password, account }) : {list};
                res.send({
                  result,
                  status: 0,
                  msg: '获取权限列表数据成功'
                })
              })
              .catch((err) => {
                res.send({
                  result: err,
                  status: 0,
                  msg: '获取全权限列表数据失败'
                })
              })
          }
        })
    })
  }

  /**
   * 指定开启接口
   */
  Start() {
    this.getAllMenuItem();
    this.getMenuList();
  }
}

const menu = new MENU();
menu.Start();
