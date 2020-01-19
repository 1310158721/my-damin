<template>
  <div class="search-bar-wrapper">
    <el-input size='small' class="search-bar-content" @keyup.enter.native='throttleSureKeyword' v-model="keyword" :placeholder="placeholder" />
    <el-button size='small' type='primary' :icon='icon' circle @click='throttleSureKeyword' />
  </div>
</template>

<script>
import { $throttle } from '@/assets/js/utils';
export default {
  name: 'SearchBar',
  components: {},
  props: {
    value: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'el-icon-search'
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    }
  },
  data () {
    return {};
  },
  computed: {
    keyword: {
      get () {
        return this.value;
      },
      set (val) {
        this.$emit('input', val);
        this.$emit('change', val);
      }
    },
    throttleSureKeyword () {
      return $throttle(() => this.sureKeyword(), 1000);
    }
  },
  methods: {
    sureKeyword () {
      this.$emit('sureKeyword', this.keyword);
    }
  },
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.search-bar-wrapper {
  width: 250px;
  height: 100%;
  position: relative;
  border-radius: 16px;
  .el-input {
    width: calc(100% - 16px);
    position: absolute;
    left: 0;
    top: 0;
  }
  /deep/.el-button {
    float: right;
    position: relative;
    z-index: 100;
  }
}
</style>
