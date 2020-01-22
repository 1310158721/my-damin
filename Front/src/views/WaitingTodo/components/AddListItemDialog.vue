<template>
  <el-dialog
    title="新增代办事件"
    :visible.sync="addWaitingDialog"
    width="520px"
    :show-close="false"
    :before-close="closeAddWaitingDialog"
    class="add-waiting-dialog"
    modal-append-to-body
    append-to-body
    :close-on-click-modal='false'
    :close-on-press-escape='false'
  >
    <el-form
      :model="formModel"
      :rules="formRules"
      ref="formRef"
      label-width="96px"
      class="add-waiting-form"
      label-position="left"
    >
      <el-form-item size="small" label="级别:">
        <el-select size="small" v-model="formModel.level" placeholder="请选择">
          <el-option
            v-for="item in enumLevel"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item size="small" label="代办内容:" prop="content">
        <el-input
          size="small"
          :maxlength="100"
          show-word-limit
          :autosize="{ minRows: 5, maxRows: 8 }"
          type="textarea"
          v-model="formModel.content"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size='small' @click="closeAddWaitingDialog">取 消</el-button>
      <el-button size='small' type="primary" @click="throttleSure('formRef')"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { $throttle } from "@/assets/js/utils";
export default {
  name: "AddWaitingDialog",
  components: {},
  props: {
    addWaitingDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formModel: {
        level: 3,
        content: ""
      },
      formRules: {
        content: [{ required: true, message: "代办内容不能为空" }]
      }
    };
  },
  computed: {
    enumLevel() {
      return [
        { label: "一级", value: 1 },
        { label: "二级", value: 2 },
        { label: "三级", value: 3 }
      ];
    },
    throttleSure() {
      return $throttle(ref => this.sure(ref), 1000);
    }
  },
  methods: {
    async addWaitingListItem() {
      return this.$axios.post("/addWaitingListItem", this.formModel);
    },
    closeAddWaitingDialog() {
      this.formModel = {
        level: 3,
        content: ""
      };
      this.$refs["formRef"].resetFields();
      this.$emit("closeAddWaitingDialog");
    },
    sure(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addWaitingListItem().then(res => {
            const { status } = res.data;
            if (status === 0) {
              this.formModel = {
                level: 3,
                content: ""
              };
              this.$refs["formRef"].resetFields();
              this.$emit("closeAddWaitingDialog", true);
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  },
  created() {},
  mounted() {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.add-waiting-dialog {
  /deep/.el-dialog {
    .el-dialog__header {
      position: relative;
      z-index: 10;
      height: 56px;
      box-sizing: border-box;
      padding: 12px 24px;
      box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.2);
    }
    .el-dialog__body {
    }
    .el-dialog__footer {
      position: relative;
      z-index: 10;
      height: 56px;
      box-sizing: border-box;
      padding: 12px 24px;
      box-shadow: 0px -5px 5px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
