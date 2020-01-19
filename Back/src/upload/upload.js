const multer  = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'upload/files' });
const Fs = require('../utils/fs');

// 阿里云OSS对象操作
const MYOSS = require('../oss/oss');
const myOss = new MYOSS();

class UPLOAD {
  constructor() {
    this.app = global.APP;
  }

  upload () {
    this.app.post('/api/upload', upload.single('file'), (req, res, next) => {
      let { body, file } = req;
      let { directory } = body;

      /**
       * destination 上传后保存的文件夹
       * path 上传后保存的路径
       * size 文件的大小
       */
      const { destination, filename, size } = file;

      // 对文件大小做限制 1MB
      if (size >= 1024 * 1024) {
        res.send({
          result: null,
          status: 400,
          msg: '文件太大了'
        })
      } else {
        myOss.setBuckName('tanglihe-admin').then(() => {
          // 上传阿里云
          myOss.put(`${destination}/${filename}`, `${directory}/${filename}`)
          .then(data => {
            // 获取阿里云在线地址
            const url = data.res.requestUrls[0];
            // 删除本地文件夹内容
            Fs.deleteFolder(`${destination}`);
            // 接口返回信息
            res.send({
              result: {
                url,
                size
              },
              status: 0,
              msg: '上传成功'
            })
          }).catch((err) => {
            console.log(err);
          });
        });
      }
    })
  }

  Start() {
    this.upload();
  }
}

const myUpload = new UPLOAD();
myUpload.Start();

