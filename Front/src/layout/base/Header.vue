<template>
  <div class="header">
    <i class="iconfont collapse-icon" :class="collapseClass" @click='collapseIconClick' v-if='$store.state.isFixedSystemAside' />
    <my-breadcrumb />
    <div style="flex: 1;"></div>
    <UserCenter />
  </div>
</template>

<script>
import EventBus from '@/assets/js/eventBus';
import MyBreadcrumb from './components/Breadcrumb';
import UserCenter from './components/userCenter';
export default {
  name: 'MyHeader',
  components: {
    MyBreadcrumb,
    UserCenter
  },
  props: {},
  data () {
    return {
      isCollapse: false
    };
  },
  computed: {
    collapseClass () {
      return this.isCollapse ? 'icon-weibiaoti26' : 'icon-daohangzhankai-';
    }
  },
  methods: {
    collapseIconClick () {
      this.isCollapse = !this.isCollapse;
      // VUE 事件中心调用 switchMenuCollapse 事件
      EventBus.$emit('switchMenuCollapse', this.isCollapse);
    }
  },
  created () {},
  mounted () {
    window.onresize = () => {
      if (window.innerWidth <= 900) {
        this.isCollapse = true;
        EventBus.$emit('switchMenuCollapse', true);
      }
    };
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
.header {
  height: 50px;
  width: 100%;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  flex-direction: row;
  .collapse-icon {
    width: 50px;
    height: 50px;
    font-size: 30px;
    line-height: 50px;
    text-align: center;
    cursor: pointer;
    color: rgba(0,0,0,.65);
    margin-right: 8px;
    &:hover {
      background-color: rgba(0,0,0,.025);
      color: rgb(64, 158, 255);
    }
  }
}
</style>
