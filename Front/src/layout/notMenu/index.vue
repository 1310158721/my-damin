<template>
  <el-container class="not-menu-wrapper">
    <el-header>
      <el-page-header @back="goBack" :content="$route.meta.title"></el-page-header>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'NotMenu',
  components: {},
  props: {},
  data () {
    return {};
  },
  computed: {},
  methods: {
    goBack () {
      this.$router.back();
    }
  },
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.not-menu-wrapper {
  width: 100vw;
  height: 100vh;
  .el-header {
    height: 50px !important;
    box-shadow: 0px 10px 10px rgba(0,0,0,.1);
    .el-page-header {
      height: 50px;
      line-height: 50px;
    }
  }
  .el-main {
    padding: 0;
    margin: 0;
  }
}
</style>
