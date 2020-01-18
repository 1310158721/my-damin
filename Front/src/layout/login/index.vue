<template>
  <div id="login-page-wrapper">
    <el-form
      :model="formData"
      :rules="formRules"
      ref="loginForm"
      class="login-form"
    >
      <h3 class="title">系统登录</h3>
      <el-form-item size="small" prop="account">
        <el-input
          maxLength="10"
          size="small"
          placeholder="账号"
          v-model="formData.account"
        >
          <i slot="prefix" class="iconfont icon-yonghu" />
        </el-input>
      </el-form-item>
      <el-form-item size="small" prop="password">
        <el-input
          maxLength="10"
          :type="passwordType"
          size="small"
          placeholder="密码"
          v-model="formData.password"
          @keyup.enter.native="throttleSubmitForm('loginForm')"
        >
          <i slot="prefix" class="iconfont icon-mima" />
          <i
            slot="suffix"
            :class="showPswIconClass"
            class="iconfont is-show-psw-icon"
            @click.stop="shouldShowPsw = !shouldShowPsw"
          />
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          size="small"
          type="primary"
          @click="throttleSubmitForm('loginForm')"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { RegExp } from '@/assets/js/constant';
import { $throttle } from '@/assets/js/utils';
export default {
  name: 'Login',
  components: {},
  props: {},
  data () {
    return {
      formData: {
        account: '',
        password: ''
      },
      formRules: {
        account: [
          { required: true, message: '账号不能为空哟' },
          { min: 4, max: 10, message: '长度只能在 4 到 10 个字符哟' },
          { pattern: RegExp.ACCOUNT, message: '只支持字母哟' }
        ],
        password: [
          { required: true, message: '密码不能为空哟' },
          { min: 4, max: 10, message: '长度只能在 4 到 10 个字符哟' },
          {
            pattern: RegExp.PASSWORD,
            message: '只支持字母或字母组合,且首位必须为字母'
          }
        ]
      },
      shouldShowPsw: false
    };
  },
  computed: {
    passwordType () {
      return this.shouldShowPsw ? 'text' : 'password';
    },
    showPswIconClass () {
      return this.shouldShowPsw ? 'icon-icon-test' : 'icon-xianshi';
    },
    // 缓存节流函数(throttleSubmitForm接受的参数通过arguments内参传递给了throttle接受的函数)
    throttleSubmitForm () {
      return $throttle(formName => this.submitForm(formName), 2000);
    }
  },
  methods: {
    async login (params = {}) {
      return await this.$axios.get('/login', { params });
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.login(this.formData).then((res) => {
            if (res.data.status === 0) {
              this.$router.push({
                path: '/Dashboard',
                replace: true
              });
              this.$message.success(res.data.msg);
            }
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  },
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
#login-page-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #2d3a4b;
  position: relative;
  .login-form {
    width: 520px;
    padding: 0 35px;
    box-sizing: border-box;
    min-height: 200px;
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    .title {
      font-size: 26px;
      color: #eee;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: 700;
      line-height: 29px;
    }
    .is-show-psw-icon {
      cursor: pointer;
    }
    .el-button {
      width: 100%;
    }
  }
}
</style>
