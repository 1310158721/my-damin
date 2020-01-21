<template>
  <el-dialog
    title="编辑权限"
    class="edit-permission-dialog"
    :visible.sync="editPermissionDialog"
    @opened="handleDialogOpen"
    @closed='editPermissionDialogClosed'
    width="800px"
    modal-append-to-body
    append-to-body
    :show-close='false'
    :close-on-click-modal='false'
    :close-on-press-escape='false'
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
        <el-select :disabled='role === "SUPERADMIN"' size='small' v-model="editPermissionModel.role" placeholder="请选择" @change='roleChange'>
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
    },
    role: {
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
    // 获取 单个用户信息
    async getSingleUser (_id) {
      return this.$axios.get('/getSingleUser', { params: { _id } });
    },
    // 获取 所有用户列表
    async getAllMenu () {
      return this.$axios.get('/getAllMenu');
    },
    // 更新 单个用户信息
    async updateSingleUserById (data) {
      return await this.$axios.post('/updateSingleUserById', data);
    },
    // 弹窗显示钩子
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
            // 将 permission 变成数组，供树形控件接收
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
    // 循环遍历获取相关菜单的 permission 值，全部被保存在 arr，在函数引用时外部定义一个变量来代替 arr 即可在函数外部获取
    getPermissionLoop(list, arr = []) {
      list.map((i) => {
        if (i.children && i.children.length) {
          this.getPermissionLoop(i.children, arr);
        }
        arr.push(i.permission);
      })
    },
    // 点击树形控件复选框时
    handleCheck () {
      // 获取 当前树形控件已选的key值
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      // 获取 权限管理相关的 菜单模块
      const list = this.menuList.filter((i) => i.permission === 'PERMISSIONMANAGE');
      // 保存权限管理模块相关的所有 permission 值
      const permissionArr = [];
      // 保存所有导航菜单模块的所有 permission 值
      const isAll = [];
      this.getPermissionLoop(list, permissionArr);
      this.getPermissionLoop(this.menuList, isAll);

      // 树形控件当前已选的 key 值 是否包含了 权限管理模块的任一 permission 值
      let isExsit = false;

      permissionArr.map((i) => {
        if (checkedKeys.includes(i)) {
          isExsit = true;
        }
      })

      if (!isExsit) {0
        this.editPermissionModel.role = 'COMMON';
      } else {
        // 属性控件是否已被全选
        if (isAll.length === checkedKeys.length) {
          this.editPermissionModel.role = 'SUPERADMIN';
        } else {
          this.editPermissionModel.role = 'ADMIN';
        }
      }
    },
    // 弹窗取消按钮事件
    cancelPermissionDialog () {
      this.editPermissionModel = {};
      this.$emit('closePermissionDialog');
    },
    // 弹窗确定按钮事件
    surePermissionDialog () {
      // 获取树形控件当前已选的 key 值
      let selectPermissionKey = this.$refs.tree.getCheckedKeys();
      // 将字符串类型转为数组并过滤掉可能为 null，undefined等情况
      selectPermissionKey = selectPermissionKey.filter(i => i).join(',');
      // 只有超级管理员修改自己本身的数据时，需要刷新页面，更新导航菜单栏
      if (this.role === 'SUPERADMIN') {
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
              this.cancelPermissionDialog();
            }
          });
      }
    },
    // 关闭弹窗动画结束后钩子
    editPermissionDialogClosed() {
      this.isLoading = false;
      this.editPermissionModel = {};
      this.menuList = null;
    },
    /**
     * 权限级别改变
     * 级别 COMMON: 导航菜单不能有权限管理（PERMISSIONMANAGE）的
     * 级别 ADMIN：导航菜单有权限管理（PERMISSIONMANAGE），但默认不会全选
     * 级别 SUPERADMIN：导航菜单有权限管理（PERMISSIONMANAGE），默认全选
     */
    roleChange(val) {
      // 获取 权限管理相关的 菜单模块
      const list = this.menuList.filter((i) => i.permission === 'PERMISSIONMANAGE');
      // 保存权限管理模块相关/所有导航菜单模块的所有 permission 值
      const permissionArr = [];
      // 获取 当前树形控件已选的key值
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      if (val === 'COMMON') {
        // 此时 permissionArr 代表 权限管理模块相关的所有 permission 值
        this.getPermissionLoop(list, permissionArr);
        // 将树形控件已选的 key 过滤掉 权限管理相关的 key 值
        checkedKeys = checkedKeys.filter((i) => !permissionArr.includes(i));
        // 将过滤后的 key 值，设置到属性控件上
        this.$refs.tree.setCheckedKeys(checkedKeys);
      } else if(val === 'ADMIN') {
        // 此时 permissionArr 代表 权限管理模块相关的所有 permission 值
        this.getPermissionLoop(list, permissionArr);
        // 将当前树形控件已选的 key 值 与 权限管理模块相关的 permission 合并
        checkedKeys = [... new Set([...checkedKeys, ...permissionArr])];
        // 将合并后的 permission 值设置到 树形控件上
        this.$refs.tree.setCheckedKeys(checkedKeys);
      } else {
        // 此时 permissionArr 代表 所有导航菜单模块的所有 permission 值
        this.getPermissionLoop(this.menuList, permissionArr);
        // 全选树形控件的 key 值
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
      height: 56px;
      box-sizing: border-box;
      padding: 12px 24px;
      box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.2);
    }
    .el-dialog__body {
      height: 55vh;
      overflow: auto;
      .avatar {
        width: 144px;
        height: 144px;
        overflow: hidden;
      }
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
