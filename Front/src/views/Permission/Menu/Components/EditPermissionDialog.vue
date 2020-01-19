<template>
  <el-dialog
    title="编辑权限"
    class="edit-permission-dialog"
    :visible.sync="editPermissionDialog"
    @open="handleDialogOpen"
    width="800px"
    :before-close="closePermissionDialog"
  >
    <el-form
      :model="editPermissionModel"
      :rules="editPermissionRules"
      ref="editPermissionRef"
      label-width="96px"
      class="edit-permission-dialog"
      label-position="left"
    >
      <el-form-item size="small" label="账号：" prop="account">
        <el-input v-model="editPermissionModel.account" disabled />
      </el-form-item>
      <el-form-item size="small" label="密码：" prop="password">
        <el-input v-model="editPermissionModel.password" disabled />
      </el-form-item>
      <el-form-item size="small" label="名称：" prop="name">
        <el-input v-model="editPermissionModel.name" disabled />
      </el-form-item>
      <el-form-item size="small" label="号码：" prop="mobile">
        <el-input v-model="editPermissionModel.mobile" disabled />
      </el-form-item>
      <el-form-item
        size="small"
        label="权限菜单："
        prop="permission"
        v-if="menuList"
      >
        <el-tree
          :data="menuList"
          show-checkbox
          node-key="permission"
          ref="tree"
          check-on-click-node
          default-expand-all
          check-strictly
          :default-checked-keys="editPermissionModel.permission"
          expand-on-click-node
          @node-click="nodeClick"
          :props="defaultProps"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancelPermissionDialog">取 消</el-button>
      <el-button size="small" type="primary" @click="surePermissionDialog"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditPermissionDialog',
  components: {},
  props: {
    editPermissionDialog: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      editPermissionModel: {},
      editPermissionRules: {},
      menuList: null,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    };
  },
  computed: {},
  methods: {
    async getSingleUser (_id) {
      return this.$axios.get('/getSingleUser', { params: { _id } });
    },
    async getAllMenu () {
      return this.$axios.get('/getAllMenu');
    },
    async updateSingleUserById (data) {
      return await this.$axios.post('/updateSingleUserById', data);
    },
    handleDialogOpen () {
      this.getSingleUser(this.id).then(res => {
        const { result, status } = res.data;
        if (status === 0) {
          this.editPermissionModel = Object.assign({}, result, {
            permission: result.permission.split(',')
          });
          console.log(this.editPermissionModel);
        }
      });
      this.getAllMenu().then(res => {
        const { result, status } = res.data;
        if (status === 0) {
          this.menuList = result;
        }
      });
    },
    closePermissionDialog () {
      this.$emit('closePermissionDialog');
    },
    nodeClick (data, node) {
      this.childNodesChange(node);
      this.parentNodesChange(node);
    },
    childNodesChange (node) {
      let len = node.childNodes.length;
      for (let i = 0; i < len; i++) {
        node.childNodes[i].checked = false;
        this.childNodesChange(node.childNodes[i]);
      }
    },
    parentNodesChange (node) {
      if (node.parent) {
        for (let key in node) {
          if (key == 'parent') {
            node[key].checked = true;
            this.parentNodesChange(node[key]);
          }
        }
      }
    },
    cancelPermissionDialog () {
      this.editPermissionModel = {};
      this.closePermissionDialog();
    },
    surePermissionDialog () {
      let selectPermissionKey = this.$refs.tree.getCheckedKeys();
      selectPermissionKey = selectPermissionKey.filter(i => i).join(',');

      this.$confirm('此操作需要刷新当前页面, 是否继续?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.updateSingleUserById({
            _id: this.id,
            permission: selectPermissionKey
          }).then(res => {
            const { status } = res.data;
            if (status === 0) {
              window.location.reload();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    }
  },
  created () {},
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.edit-permission-dialog {
  /deep/.el-dialog {
    .el-dialog__header {
      position: relative;
      z-index: 10;
      box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.2);
    }
    .el-dialog__body {
      height: 420px;
      overflow: auto;
    }
    .el-dialog__footer {
      position: relative;
      z-index: 10;
      box-shadow: 0px -5px 5px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
