<template>
  <el-dialog
    title="编辑权限"
    class="edit-permission-dialog"
    :visible.sync="editPermissionDialog"
    @open="handleDialogOpen"
    @closed='editPermissionDialogClosed'
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
      v-loading='isLoading'
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
      <el-form-item size="small" label="级别：">
        <el-select size='small' v-model="editPermissionModel.role" placeholder="请选择" @change='roleChange'>
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
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
          default-expand-all
          :default-checked-keys="editPermissionModel.permission"
          expand-on-click-node
          :props="defaultProps"
          @check='handleCheck'
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
      isLoading: false,
      editPermissionModel: {},
      editPermissionRules: {},
      menuList: null,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    };
  },
  computed: {
    roleOptions() {
      if (this.$store.state.userInfo.role !== 'SUPERADMIN') {
        return [
          { label: '普通用户', value: 'COMMON' }
        ]
      } else {
        return [
          { label: '普通用户', value: 'COMMON' },
          { label: '管理员', value: 'ADMIN' },
          { label: '超级管理员', value: 'SUPERADMIN' }
        ]
      }
    }
  },
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
      this.isLoading = true;
      // axios.all 优化并发处理
      this.$axios.all([this.getSingleUser(this.id), this.getAllMenu()])
        .then(this.$axios.spread((singleUser, allMenu) => {
          const singleUserStatus = singleUser.data.status;
          const singleUserResult = singleUser.data.result;
          const allMenuStatus = allMenu.data.status;
          let allMenuResult = allMenu.data.result;
          if (singleUserStatus === 0) {
            this.editPermissionModel = Object.assign({}, singleUserResult, {
              permission: singleUserResult.permission.split(',')
            });
          }
          if (allMenuStatus === 0) {
            this.menuList = allMenuResult;
          }

          if (singleUserStatus === 0 && allMenuStatus === 0) {
            this.isLoading = false;
          }
        }))
    },
    closePermissionDialog () {
      this.$emit('closePermissionDialog');
    },
    handleCheck () {
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      const list = this.menuList.filter((i) => i.permission === 'PERMISSIONMANAGE');
      const permissionArr = [];
      const isAll = [];
      this.getPermissionLoop(list, permissionArr);
      this.getPermissionLoop(this.menuList, isAll);

      let isExsit = false;

      permissionArr.map((i) => {
        if (checkedKeys.includes(i)) {
          isExsit = true;
        }
      })

      if (!isExsit) {
        this.editPermissionModel.role = 'COMMON';
      } else {
        if (isAll.length === checkedKeys.length) {
          this.editPermissionModel.role = 'SUPERADMIN';
        } else {
          this.editPermissionModel.role = 'ADMIN';
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

      // 只有 超级管理员才能修改自己本身的数据，需要刷新页面，更新导航菜单栏
      if (this.$store.state.userInfo.role === 'SUPERADMIN') {
        this.$confirm('此操作需要刷新当前页面, 是否继续?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.updateSingleUserById({
              _id: this.id,
              permission: selectPermissionKey,
              role: this.editPermissionModel.role
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
      } else {
        this.updateSingleUserById({
          _id: this.id,
          permission: selectPermissionKey,
          role: this.editPermissionModel.role
        })
          .then(res => {
            const { status } = res.data;
            if (status === 0) {
              this.closePermissionDialog();
            }
          });
      }
    },
    editPermissionDialogClosed() {
      this.isLoading = false;
      this.editPermissionModel = {};
      this.menuList = null;
    },
    getPermissionLoop(list, arr = []) {
      list.map((i) => {
        if (i.children && i.children.length) {
          this.getPermissionLoop(i.children, arr);
        }
        arr.push(i.permission);
      })
    },
    roleChange(val) {
      const list = this.menuList.filter((i) => i.permission === 'PERMISSIONMANAGE');
      const permissionArr = [];
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      if (val === 'COMMON') {
        this.getPermissionLoop(list, permissionArr);
        checkedKeys = checkedKeys.filter((i) => !permissionArr.includes(i));
        this.$refs.tree.setCheckedKeys(checkedKeys);
      } else if(val === 'ADMIN') {
        this.getPermissionLoop(list, permissionArr);
        checkedKeys = [... new Set([...checkedKeys, ...permissionArr])];
        this.$refs.tree.setCheckedKeys(checkedKeys);
      } else {
        this.getPermissionLoop(this.menuList, permissionArr);
        this.$refs.tree.setCheckedKeys(permissionArr);
      }
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
      height: 56px;
      box-sizing: border-box;
    }
    .el-dialog__body {
      height: 60vh;
      overflow: auto;
    }
    .el-dialog__footer {
      position: relative;
      z-index: 2010;
      box-shadow: 0px -5px 5px rgba(0, 0, 0, 0.2);
      height: 56px;
      box-sizing: border-box;
    }
  }
}
</style>
