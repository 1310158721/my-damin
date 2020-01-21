<template>
  <div>
    <p>
      1、通过指令传值的形式来实现复制功能 v-clipboard='"scscscsc"'
    </p>
    <el-button type='success' size='small' class='mgt-20' v-clipboard='"我是要被复制的文本（可动态修改）"'>
      我是要被复制的文本（可动态修改）
    </el-button>
    <el-divider></el-divider>
    <p>
      2、通过指令绑定元素的某个属性(如：clipboard-data)来传值 clipboard-data='scscascsa'
    </p>
    <el-input style="width: 300px;" size='small' placeholder="请输入内容" v-model="clipboardData" class='mgt-20'>
      <template slot="append">
        <el-button ref='clipboard' type='primary' size='small' v-clipboard @click='handleClick'>复制</el-button>
      </template>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'Clipboard',
  data() {
    return {
      clipboardData: ''
    };
  },
  computed: {},
  methods: {
    handleClick() {
      const clipboard = this.$refs.clipboard.$el;
      // 设置的属性 data 开头，不会报错
      clipboard.setAttribute('data-clipboard', this.clipboardData);
    }
  }
};
</script>

<style lang="scss" scoped></style>
