<template>
  <el-container id='app-container'>
    <MyAside />
    <el-container id='app-right-aside' :class="[$store.state.isFixedHeader ? 'fixed-header' : 'release-header']">
      <MyHeader id='app-header' />
      <my-tab v-if='$store.state.isShowSystemTabView' />
      <NyContent id='app-content' />
    </el-container>
    <LayoutConfig />
  </el-container>
</template>

<script>
import MyHeader from './Header';
import MyAside from './Aside';
import NyContent from './Content';
import MyTab from './components/tab';
import LayoutConfig from '@/components/system/layoutConfig';
export default {
  name: 'BaseLayout',
  components: {
    MyHeader,
    MyAside,
    NyContent,
    MyTab,
    LayoutConfig
  },
  props: {},
  data () {
    return {};
  },
  computed: {},
  methods: {},
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
#app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  #app-right-aside {
    &.release-header {
      display: block;
      min-height: 100%;
      overflow-y: auto;
      #app-header {}
      #app-content {}
    }
    &.fixed-header {
      height: 100%;
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
      #app-header {}
      #app-content {
        flex: 1;
        height: 100%;
        overflow: auto;
      }
    }
  }
}
</style>
