<template>
  <el-dropdown
    @command="handleCommand"
    trigger="click"
    class="user-center-wrapper"
  >
    <!-- <div class="center-button"></div> -->
    <el-avatar class="center-button" :size="50" :src="avatarUrl" />
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="(item, index) in dropdownEnum"
        :key="index"
        :command="item.command"
        :divided="item.divided"
        :disabled="item.disabled"
        >{{ item.title }}</el-dropdown-item
      >
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import Cookie from 'js-cookie';
import { mapMutations } from 'vuex';
import avatarUrl from '@/assets/img/default.jpg';
export default {
  name: 'UserCenter',
  components: {},
  props: {},
  data () {
    return {
      avatarUrl: avatarUrl
    };
  },
  computed: {
    dropdownEnum () {
      return [
        {
          command: 'personalCenter',
          title: '个人中心',
          disabled: false,
          divided: false,
          cb: this.personalCenter
        },
        {
          command: 'dashboard',
          title: '首页',
          disabled: this.$route.path === '/Dashboard',
          divided: false,
          cb: this.dashboard
        },
        {
          command: 'layoutConfig',
          title: '系统布局',
          disabled: false,
          divided: false,
          cb: this.layoutConfig
        },
        {
          command: 'loginOut',
          title: '退出登录',
          disabled: false,
          divided: true,
          cb: this.loginOut
        }
      ];
    }
  },
  methods: {
    ...mapMutations(['RESETMENULIST', 'SETLAYOUTCONFIGDRAWER']),
    handleCommand (command) {
      this.dropdownEnum.filter(i => i.command === command)[0].cb();
    },
    personalCenter () {
      this.$router.push({ path: '/PersonalCenter' });
    },
    dashboard () {
      this.$router.push({ path: '/Dashboard', replace: true });
    },
    layoutConfig () {
      this.SETLAYOUTCONFIGDRAWER(true);
    },
    loginOut () {
      this.$confirm('此操作将退出登录状态', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        Cookie.remove('token');
        Cookie.remove('cacheRoutes');
        this.RESETMENULIST([]);
        this.$router.push({ path: '/Login', replace: true });
      }).catch(() => {});
    }
  },
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.user-center-wrapper {
  width: 108px;
  height: 50px;
  position: relative;
  .center-button {
    width: 50px;
    height: 50px;
    background-color: lightblue;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    outline: none;
    cursor: pointer;
  }
}
</style>
