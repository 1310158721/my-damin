<template>
  <el-dialog
    title="新增用户"
    class="add-permission-dialog"
    :visible.sync="addPermissionDialog"
    @opened="handleDialogOpen"
    width="800px"
    modal-append-to-body
    append-to-body
    :show-close='false'
    :close-on-click-modal='false'
    :close-on-press-escape='false'
  >
    <el-form
      :model="addPermissionModel"
      :rules="editPermissionRules"
      ref="addPermissionRef"
      label-width="96px"
      class="edit-permission-dialog"
      label-position="left"
    >
      <el-form-item size="small" label="账号：" prop="account">
        <el-input v-model="addPermissionModel.account" placeholder='请输入账号' />
      </el-form-item>
      <el-form-item size="small" label="密码：" prop="password">
        <el-input v-model="addPermissionModel.password" placeholder='请输入密码' />
      </el-form-item>
      <el-form-item size="small" label="名称：" prop="name">
        <el-input v-model="addPermissionModel.name" placeholder='请输入名称' />
      </el-form-item>
      <el-form-item size="small" label="级别：">
        <el-select size='small' v-model="addPermissionModel.role" placeholder="请选择" @change='roleChange'>
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item size="small" label="号码：" prop="mobile">
        <el-input v-model="addPermissionModel.mobile" placeholder='请输入号码' />
      </el-form-item>
      <el-form-item size='small' label="头像：" prop="avatar">
        <div class="avatar">
          <UploadFiles
            action='/api/upload'
            :data="{
              directory: 'avatar'
            }"
            :limit='1'
            @removeCallBack='removeCallBack'
            @successCallback='successCallback'
          />
        </div>
      </el-form-item>
      <el-form-item
        size="small"
        label="权限菜单："
        prop="permission"
        v-show='menuList'
      >
        <el-tree
          :data="menuList"
          show-checkbox
          node-key="permission"
          ref="tree"
          default-expand-all
          :default-checked-keys="addPermissionModel.permission"
          expand-on-click-node
          :props="defaultProps"
          @check='handleCheck'
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancelPermissionDialog('addPermissionRef')">取 消</el-button>
      <el-button size="small" type="primary" @click="surePermissionDialog('addPermissionRef')"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { RegExp } from '@/assets/js/constant';
export default {
  name: 'AddPermissionDialog',
  components: {},
  props: {
    addPermissionDialog: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      addPermissionModel: {
        account: '',
        password: '',
        name: '',
        mobile: '',
        avatar: '',
        permission: [],
        role: 'COMMON'
      },
      editPermissionRules: {
        account: [
          { required: true, message: '请输入用户账号' },
          { pattern: RegExp.ACCOUNT, message: '账号格式不正确，4～10个的字母' }
        ],
        password: [
          { required: true, message: '请输入用户密码' },
          { pattern: RegExp.PASSWORD, message: '密码格式不正确，4～10个的字母或数字组合' }
        ],
        name: [
          { required: true, message: '请输入用户名称' },
          { pattern: RegExp.USERNAME, message: '名称格式不正确，4～10个的字母或中文组合' }
        ],
        mobile: [
          { required: true, message: '请输入用户号码' },
          { pattern: RegExp.MOBILE, message: '号码格式不正确'}
        ],
        avatar: [
          { required: true, message: '请上传头像' }
        ]
      },
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
    async getAllMenu () {
      return await this.$axios.get('/getAllMenu');
    },
    async addSingleUser (data) {
      return await this.$axios.post('/addSingleUser', data);
    },
    // 弹窗显示时钩子
    handleDialogOpen () {
      this.getAllMenu()
        .then((res) => {
          const { result, status } = res.data;
          if (status === 0) {
            this.menuList = result;
            this.$refs.tree.setCheckedKeys(['DASHBOARD']);
          }
        });
    },
    // 弹窗取消按钮事件
    cancelPermissionDialog (formName) {
      this.$refs[formName].resetFields();
      this.addPermissionModel = {
        account: '',
        password: '',
        name: '',
        mobile: '',
        avatar: '',
        permission: [],
        role: 'COMMON'
      };
      this.$emit('closeAddPermissionDialog');
    },
    surePermissionDialog (formName) {
      this.$refs[formName].validate((valid) => {
          if (valid) {
            let selectPermissionKey = this.$refs.tree.getCheckedKeys();
            selectPermissionKey = selectPermissionKey.filter(i => i).join(',');
            const params = Object.assign({}, this.addPermissionModel, { permission: selectPermissionKey });
            this.addSingleUser(params)
              .then((res) => {
                const { status } = res.data;
                if (status === 0) {
                  this.$emit('surePermissionDialog');
                }
              });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    removeCallBack () {
      this.addPermissionModel.avatar = '';
    },
    successCallback (response) {
      this.addPermissionModel.avatar = response.result.url;
    },
    /**
     * 获取 list 里面的所有 permission 值
     */
    getPermissionLoop(list, arr = []) {
      list.map((i) => {
        if (i.children && i.children.length) {
          this.getPermissionLoop(i.children, arr);
        }
        arr.push(i.permission);
      })
    },
    handleCheck () {
      // 获取 当前树形控件选中的菜单key值
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      // 获取 导航菜单权限管理模块数据
      const list = this.menuList.filter((i) => i.permission === 'PERMISSIONMANAGE');
      const permissionArr = [];
      const isAll = [];
      // 获取 导航菜单权限管理相关的权限
      this.getPermissionLoop(list, permissionArr);
      // 获取 所有导航菜单相关的权限
      this.getPermissionLoop(this.menuList, isAll);
      let isExsit = false;
      permissionArr.map((i) => {
        if (checkedKeys.includes(i)) {
          isExsit = true;
        }
      })

      if (!isExsit) {
        this.addPermissionModel.role = 'COMMON';
      } else {
        if (isAll.length === checkedKeys.length) {
          this.addPermissionModel.role = 'SUPERADMIN';
        } else {
          this.addPermissionModel.role = 'ADMIN';
        }
      }
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
  created() {}
};
</script>

<style lang="scss" scoped>
.add-permission-dialog {
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
