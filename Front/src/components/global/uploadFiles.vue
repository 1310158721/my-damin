<template>
  <div class="wrapper">
    <el-upload
      class="my-upload"
      :class='{"hide-uploader": hideUploader}'
      :action="action"
      :list-type="listType"
      :multiple='multiple'
      :name='name'
      :data='data'
      :file-list='defaultPics'
      :headers='headers'
      :limit='limit'
      :on-remove='handleRemove'
      :on-success='handleSuccess'
      :on-progress='handleProgress'
      :before-upload='handleBeforeUpload'
      :on-change='handleChange'
      :before-remove='handleBeforeRemove'
      :on-error='handleError'
      :disabled='disabled'
      :on-exceed='handleExceed'
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui';
export default {
  name: "UploadFiles",
  components: {},
  props: {
    action: {
      type: String,
      default: '/api/upload'
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: 'file'
    },
    defaultPics: {
      type: Array,
      default: () => []
    },
    headers: {
      type: Object,
      default: () => {}
    },
    limit: {
      type: Number,
      default: 10
    },
    disabled: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      hideUploader: false
    };
  },
  computed: {},
  methods: {
    handleRemove(file, fileList) {
      this.hideUploader = fileList.length >= this.limit;
      this.$emit('removeCallBack', file, fileList)
    },
    handleSuccess(response, file, fileList) {
      this.$emit('successCallback', response, file, fileList);
    },
    handleProgress(event, file, fileList) {
      this.$emit('progressCallback', event, file, fileList);
    },
    handleBeforeUpload(file) {
      this.$emit('beforeUploadCallback', file);
    },
    // 是否显示上传器
    handleChange(file, fileList) {
      this.hideUploader = fileList.length >= this.limit;
    },
    handleBeforeRemove(file, fileList) {
      this.$emit('beforeRemoveCallback', file, fileList);
    },
    handleError(err, file, fileList) {
      this.$emit('errorCallback', err, file, fileList);
    },
    handleExceed(files, fileList) {
      Message.warning('图片最大上传数不能超过' + this.limit);
    }
  },
  created() {},
  mounted() {},
  watch: {}
};
</script>

<style lang="scss" scoped>
$width: 144px;
$height: 144px;

.hide-uploader {
  /deep/.el-upload {
    display: none;
  }
}

.wrapper {
  .my-upload {
    /deep/.el-upload-list {
      padding: 0;
      margin: 0;
      .el-upload-list__item {
        height: $height;
        width: $width;
        padding: 0;
        margin: 0;
      }
    }
    /deep/.el-upload {
      height: $height;
      width: $width;
    }
    /deep/.el-upload--picture-card {
      line-height: $height;
    }
  }
}
</style>
