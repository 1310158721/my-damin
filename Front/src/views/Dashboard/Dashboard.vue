<template>
  <div class="dashboard-wrapper">Dashboard</div>
</template>

<script>
export default {
  name: 'Dashboard',
  components: {},
  props: {},
  data () {
    return {};
  },
  computed: {},
  methods: {},
  created () {},
  mounted () {
    console.log(this.$store.state.userInfo);
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
.dashboard-wrapper {
  height: 2000px;
}
</style>
