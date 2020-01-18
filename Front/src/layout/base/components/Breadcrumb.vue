<template>
  <div class="my-breadcrumb">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <transition-group name='breadcrumb'>
        <template>
          <el-breadcrumb-item v-for='(i, index) in breadcrumb' :key='index'>
            <a @click.prevent='handleLink(i)' :class='{"is-link": i.path}'>{{ i.title }}</a>
          </el-breadcrumb-item>
        </template>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'MyBreadcrumb',
  components: {},
  props: {},
  data () {
    return {
      list: null,
      isMatched: false,
      breadcrumb: []
    };
  },
  computed: {},
  methods: {
    // 循环遍历删除path 不为当前 this.$route.path 的每一个 item
    loop (list) {
      for (let i=list.length - 1; i>=0; i--) {
        if (list[i].children && list[i].children.length) {
          this.loop(list[i].children);
        } else {
          // 保留最后一个children所有的item
          if (!list.filter((k) => k.path === this.$route.path).length) {
            list.splice(i, 1);
          }
        }
      }
    },
    // 处理数据，获取breadcrumb
    getBreadcrumb (list) {
      list.map((i) => {
        if (i.children && i.children.length) {
          this.breadcrumb.push({ path: i.path || null, title: i.title });
          this.getBreadcrumb(i.children);
        } else {
          if (this.$route.path === i.path) {
            this.breadcrumb = this.breadcrumb.map((k) => !k.path ? ({ path: list[0].path, title: k.title }) : k);
            this.breadcrumb.push({ path: null, title: i.title });
            if (!this.breadcrumb.filter((i) => i.title === 'Dashboard').length) {
              this.breadcrumb.unshift({ path: '/Dashboard', title: 'Dashboard' });
            }
          }
        }
      });
    },
    // 多次遍历删除空数组(children = [])
    delEmptyArray (list) {
      for (let t = 0; t < 3; t++) {
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].children !== null) {
            if (!list[i].children.length) {
              list.splice(i, 1);
            } else {
              this.delEmptyArray(list[i].children);
            }
          }
        }
      }
    },
    // 包装函数
    getFinalBreadcrumb () {
      this.loop(this.list);
      this.delEmptyArray(this.list);
      this.getBreadcrumb(this.list);
    },
    // 面包屑 item 点击事件
    handleLink (item) {
      if (!item.path || item.path === this.$route.path) {
        return false;
      }
      this.$router.push({ path: item.path });
    }
  },
  created () {
    this.list = JSON.parse(JSON.stringify(this.$store.state.menuList));
    this.getFinalBreadcrumb();
  },
  watch: {
    '$route' () {
      this.breadcrumb = [];
      this.list = JSON.parse(JSON.stringify(this.$store.state.menuList));
      this.getFinalBreadcrumb();
    }
  }
};
</script>

<style lang="scss" scoped> 
/* breadcrumb transition */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all .1s;
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all .1s;
}

.breadcrumb-leave-active {
  position: absolute;
}

.my-breadcrumb {
  .el-breadcrumb {
    line-height: 50px;
    /deep/.el-breadcrumb__inner a {
      color: #97a8be;
      &.is-link {
        color: #303133;
        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}
</style>
