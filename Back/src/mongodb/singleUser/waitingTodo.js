const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class WAITINGTODO {
  constructor() {
    this.app = global.APP;

    /**
     * 数据库连接的状态
     */
    this.db = mongoose.createConnection(
      `mongodb://127.0.0.1:${global.mongoPort}/waitingTodo`,
      { useUnifiedTopology: true, useNewUrlParser: true }
    );

    // mongodb 数据结构 Schema
    this.WaitingSchema = new Schema({
      createdTime: Number,
      content: String,
      level: Number
    });
  }

  /**
   * 获取用户代办列表
   */
  GetSingleUserWaitingList() {
    this.app.get('/api/getWaitingList', (req, res, next) => {
      const { token } = req.signedCookies;
      /**
       * mongodb 数据 model (多用户原因，因此要动态设置)
       */
      this.waitingModel = this.db.model(token + '_waiting_list', this.WaitingSchema);
      let {
        page = 1,
        size = 20,
        startTime = '',
        endTime = '',
        level = 0,
        keyword = ''
      } = req.query;

      console.log(level);

      /**
       * 时间临界值处理
       */
      startTime = startTime ? new Date(startTime + ' 00:00:00') : null;
      endTime = endTime ? new Date(endTime + ' 23:59:59') : null;

      /**
       * 搜索总条件
       */
      const conditions = {
        /**
         * 搜索条件的交集 $and（满足其中一个条件即可）
         */
        $and: [
          {
            /**
             * 关键字模糊搜索
             */
            $or: [
              { content: { $regex: keyword, $options: '$i' } }
            ]
          }
        ]
      };

      /**
       * 添加时间段搜索
       */
      if (startTime && endTime) {
        conditions.$and.push({
          createdTime: {
            $gte: new Date(startTime),
            $lte: new Date(endTime)
          }
        });
      }

      /**
       * 添加等级搜索
       */
      if (level) {
        conditions.$and.push({ level });
      }

      this.waitingModel
        .find(conditions)
        .limit(Number.parseInt(size))
        .skip(Number.parseInt(page - 1) * size)
        .sort({ createdTime: -1 })
        .then(doc => {
          res.send({
            result: {
              list: doc,
              count: doc.length
            },
            status: 0,
            msg: '查询用户代办列表成功'
          });
        })
        .catch((err) => {
          res.send({
            result: err,
            status: 400,
            msg: '查询用户代办列表失败'
          })
        })
    });
  }

  /**
   * 新增代办列表数据
   */
  AddSingleUserWaitingListItem() {
    this.app.post('/api/addWaitingListItem', (req, res, next) => {
      const { token } = req.signedCookies;
      const { content = '', level = 3 } = req.body;
      const Model = this.db.model(token + '_waiting_list', this.WaitingSchema);
      const addData = new Model({
        content,
        createdTime: Date.now(),
        level
      })
      addData.save()
        .then(() => {
          res.send({
            result: null,
            status: 0,
            mas: '新增代办列表数据成功'
          })
        })
        .catch((err) => {
          res.send({
            result: err,
            status: 0,
            mas: '新增代办列表数据失败'
          })
        })
    })
  }

  /**
   * 删除代办列表数据
   */
  DeleteSingleUserWaitingListItem() {
    this.app.get('/api/deleteWaitingItem', (req, res, next) => {
      const { token } = req.signedCookies;
      const { _id } = req.query;
      this.waitingModel = this.db.model(token + '_waiting_list', this.WaitingSchema);
      this.waitingModel.findByIdAndDelete(_id)
        .then(() => {
          res.send({
            result: null,
            status: 0,
            msg: '删除代办列表数据成功'
          })
        })
        .catch((err) => {
          res.send({
            result: err,
            status: 400,
            msg: '删除代办列表数据失败'
          })
        })
    })
  }

  Start() {
    this.GetSingleUserWaitingList();
    this.AddSingleUserWaitingListItem();
    this.DeleteSingleUserWaitingListItem();
  }
}

const waitingTodo = new WAITINGTODO();

waitingTodo.Start();
