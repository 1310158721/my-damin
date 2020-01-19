<template>
  <div
    class="global-loading-mask"
    v-loading="false"
    :element-loading-text="tip"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  />
</template>

<script>
export default {
  name: 'GlobalLoadingMask',
  components: {},
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    tip: {
      type: String,
      default: '拼命加载中'
    }
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
  created() {},
  mounted() {},
  watch: {}
};
</script>

<style lang="scss" scoped></style>
