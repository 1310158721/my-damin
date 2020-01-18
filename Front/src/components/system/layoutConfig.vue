<template>
  <el-drawer
    size='260px'
    class="global-system-config"
    :visible.sync="$store.state.layoutConfigDrawer"
    :before-close='handleClose'
    :with-header="false">
    <div class="body-content">
      <h3 class="drawer-title">系统布局配置</h3>
      <div class="drawer-item">
        <span class="item-tip">开启 Tags-View</span>
        <span class="item-handler">
          <el-switch
            v-model="$store.state.isShowSystemTabView"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </span>
      </div>
      <div class="drawer-item">
        <span class="item-tip">固定 Aside</span>
        <span class="item-handler">
          <el-switch
            v-model="$store.state.isFixedSystemAside"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </span>
      </div>

      <div class="drawer-item">
        <span class="item-tip">侧边栏 Logo</span>
        <span class="item-handler">
          <el-switch
            v-model="$store.state.isShowSystemLogo"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </span>
      </div>

      <div class="drawer-item">
        <span class="item-tip">固定 Header</span>
        <span class="item-handler">
          <el-switch
            v-model="$store.state.isFixedHeader"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </span>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
  name: 'LayoutConfig',
  components: {},
  props: {},
  data () {
    return {};
  },
  computed: {},
  methods: {
    ...mapMutations(['SETLAYOUTCONFIGDRAWER']),
    handleClose () {
      this.SETLAYOUTCONFIGDRAWER(false);
    }
  },
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.global-system-config {
  /deep/.el-drawer {
    outline: none;
    .el-drawer__body {
      padding: 24px;
      box-sizing: border-box;
      .drawer-title {
        font-size: 14px;
        margin: 14px 0 12px;
      }
      .drawer-item {
        display: flex;
        flex-direction: row;
        margin: 12px 0;
        .item-tip {
          flex: 1;
          font-size: 14px;
          color: rgba(0,0,0,.65);
        }
        .item-handler {
          width: 50px;
          text-align: center;
        }
      }
    }
  }
}
</style>
