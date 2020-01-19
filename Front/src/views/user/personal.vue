<template>
  <div
    class="personal-form-wrapper"
    v-loading='isLoading'
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-form
      :model="personalModel"
      :rules="personalRules"
      ref="personalRef"
      label-width="96px"
      class="personal-form"
      label-position='left'
    >
      <el-form-item size='small' label="账号：" prop="account">
        <el-input size='small' v-model="personalModel.account" placeholder='请输入用户账号' />
      </el-form-item>
      <el-form-item size='small' label="密码：" prop="password">
        <el-input size='small' v-model="personalModel.password" placeholder='请输入用户密码' />
      </el-form-item>
      <el-form-item size='small' label="名称：" prop="name">
        <el-input size='small' v-model="personalModel.name" placeholder='请输入用户名称' />
      </el-form-item>
      <el-form-item size='small' label="头像：" prop="avatar">
        <div class="avatar">
          <UploadFiles
            action='/api/upload'
            :data="{
              directory: 'avatar'
            }"
            :limit='1'
            :defaultPics='defaultPics'
            @removeCallBack='removeCallBack'
            @successCallback='successCallback'
          />
        </div>
      </el-form-item>
      <el-form-item size='small' label="号码：" prop="mobile">
        <el-input size='small' v-model="personalModel.mobile" placeholder='请输入用户号码' />
      </el-form-item>
      <el-form-item size='small' label="创建时间：" prop="mobile">
        <el-input size='small' v-model="personalModel.createdTime" disabled />
      </el-form-item>
      <el-form-item size='small' label="级别：" prop="role">
        <el-input size='small' v-model="personalModel.roleDesc" disabled />
      </el-form-item>
      <el-button type="primary" size='small' @click="throttleSubmitForm('personalRef')">上传</el-button>
    </el-form>
  </div>
</template>

<script>
import { $formDate, $throttle } from '@/assets/js/utils';
import defaultAvatar from '@/assets/img/default.jpg';
import { RegExp } from '@/assets/js/constant';
export default {
  name: 'Personal',
  components: {},
  props: {},
  data () {
    const validateAvatar = (rule, value, callback) => {
      if (!value || !value.length) {
        callback(new Error('头像不能为空'));
      } else {
        callback();
      }
    }
    return {
      isLoading: false,
      defaultPics: [],
      personalModel: {},
      personalRules: {
        account: [
          { required: true, message: '请输入用户账号' },
          { pattern: RegExp.ACCOUNT, message: '账号格式不正确，4～10个的字母' }
        ],
        password: [
          { required: true, message: '请输入用户密码' },
          { pattern: RegExp.PASSWORD, message: '密码格式不正确，4～10个的字母或数字组合' }
        ],
        name: [
          { required: true, message: '请输入用户名称' },
          { pattern: RegExp.USERNAME, message: '名称格式不正确，4～10个的字母或中文组合' }
        ],
        mobile: [
          { required: true, message: '请输入用户号码' },
          { pattern: RegExp.MOBILE, message: '号码格式不正确'}
        ],
        avatar: [
          { validator: validateAvatar }
        ]
      }
    };
  },
  computed: {
    throttleSubmitForm() {
      return $throttle((ref) => this.submitForm(ref), 1000);
    }
  },
  methods: {
    async getUserInfo() {
      this.isLoading = true;
      this.personalModel = {};
      return await this.$axios.get('/getSingleUser');
    },
    async updateUserInfo(data) {
      this.isLoading = true;
      return await this.$axios.post('/updateSingleUser', data);
    },
    formatResult(result) {
      result.createdTime = $formDate(new Date(result.createdTime), 'yyyy-MM-dd hh:mm:ss');
      result.avatar = [
        { name: 'avatar', url: result.avatar || defaultAvatar }
      ]
    },
    removeCallBack(file, fileList) {
      this.personalModel.avatar = fileList;
    },
    successCallback(response, file, fileList) {
      const url = response.result.url;
      this.personalModel.avatar = [{ name: 'avatar', url }];
    },
    formatPernalModel() {
      const result = JSON.parse(JSON.stringify(this.personalModel));
      result.avatar = this.personalModel.avatar[0].url.includes('http') ? this.personalModel.avatar[0].url : '';
      return Object.assign({}, {
        account: result.account,
        password: result.password,
        name: result.name,
        avatar: result.avatar,
        mobile: result.mobile
      });
    },
    submitForm (ref) {
      this.$refs[ref].validate((valid) => {
        if (valid) {
          this.updateUserInfo(this.formatPernalModel())
            .then((res) => {
              const { status, result } = res.data;
              if (status === 0) {
                this.isLoading = false;
              }
            });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  },
  created () {
    this.getUserInfo()
      .then((res) => {
        const { status, result } = res.data;
        if (status === 0) {
          this.isLoading = false;
          this.formatResult(result);
          this.personalModel = result;
          this.defaultPics = result.avatar;
        }
      })
  },
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.personal-form-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  .personal-form {
    width: 500px;
    padding-top: 50px;
    margin: 0 auto;
    .avatar {
      width: 144px;
      height: 144px;
      overflow: hidden;
    }
    .el-button {
      display: block;
      margin: 0 auto;
      width: 200px;
    }
  }
}
</style>
