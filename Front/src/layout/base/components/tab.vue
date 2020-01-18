<template>
  <div class="my-tab-routes" v-if='tabRoutes.length'>
    <el-tabs v-model="activeName" @tab-click="handleClick" @tab-remove="removeTab">
      <el-tab-pane v-for="(i) in tabRoutes" :key='i.path' :label="i.title" :name="i.path" :closable='i.path !== "/Dashboard"' />
    </el-tabs>
  </div>
</template>

<script>
import jsCookie from 'js-cookie';
export default {
  name: 'MyTab',
  components: {},
  props: {},
  data () {
    return {
      activeName: null,
      tabRoutes: []
    };
  },
  computed: {},
  methods: {
    handleClick (tab, event) {
      const { name } = tab;
      if (name === this.$route.path) {
        return;
      }
      this.$router.push({
        path: name
      });
    },
    removeTab (targetName) {
      // 总个数
      const count = this.tabRoutes.length;
      // 当前要删除的item的位置
      let pos = 0;
      for(let i=0;i<count; i++) {
        if (this.tabRoutes[i].path === targetName) {
          pos = i;
          break;
        }
      }
      // 当前要删除的是否为最后一项
      if (pos === count - 1) {
        // 是否为 active 项
        if (this.$route.path === targetName) {
          this.$router.push({
            path: this.tabRoutes[pos - 1].path
          });
          this.tabRoutes.splice(pos, 1);
          jsCookie.set('cacheRoutes', JSON.stringify(this.tabRoutes));
        } else {
          this.tabRoutes.splice(pos, 1);
          jsCookie.set('cacheRoutes', JSON.stringify(this.tabRoutes));
        }
      } else {
        if (this.$route.path === targetName) {
          this.$router.push({
            path: this.tabRoutes[pos + 1].path
          });
          this.tabRoutes.splice(pos, 1);
          jsCookie.set('cacheRoutes', JSON.stringify(this.tabRoutes));
        } else {
          this.tabRoutes.splice(pos, 1);
          jsCookie.set('cacheRoutes', JSON.stringify(this.tabRoutes));
        }
      }
    }
  },
  created () {
    this.activeName = this.$route.path;
    this.tabRoutes = JSON.parse(jsCookie.get('cacheRoutes'));
  },
  mounted () {},
  watch: {
    '$route' (val) {
      this.activeName = this.$route.path;
      this.tabRoutes = JSON.parse(jsCookie.get('cacheRoutes'));
    }
  }
};
</script>

<style lang="scss" scoped>
/* breadcrumb transition */
.tabs-enter-active,
.tabs-leave-active {
  transition: all .1s;
}

.tabs-enter,
.tabs-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.tabs-move {
  transition: all .1s;
}

.tabs-leave-active {
  position: absolute;
}

.my-tab-routes {
  height: 32px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  .el-tabs {
    height: 32px;
    // overflow-y: hidden;
    /deep/.el-tabs__nav-wrap::after {
      display: none;
    }
    /deep/.el-tabs__active-bar {
      display: none;
    }
    /deep/.el-tabs__item {
      height: 28px;
      line-height: 28px;
      padding: 0;
      margin: 2px 4px;
      border-radius: 4px;
      border: 1px solid #d8dce5;
      background-color: #fff;
      padding: 0 10px;
      outline: none;
      &.is-active {
        background-color: #42b983;
        color: #fff;
      }
    }
    /deep/.el-tabs__header {
      margin: 0;
    }
    /deep/.el-tabs__nav-next, /deep/.el-tabs__nav-prev {
      height: 32px;
      line-height: 32px;
    }
  }
}
</style>
