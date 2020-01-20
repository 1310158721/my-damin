<template>
  <el-dialog
    title="新增用户"
    class="add-permission-dialog"
    :visible.sync="addPermissionDialog"
    @open="handleDialogOpen"
    width="800px"
    :before-close="closeAddPermissionDialog"
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
        v-if="menuList"
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
    const validateAvatar = (rule, value, callback) => {
      if (!value || !value.length) {
        callback(new Error('头像不能为空'));
      } else {
        callback();
      }
    };
    return {
      addPermissionModel: {
        account: '',
        password: '',
        name: '',
        mobile: '',
        avatar: '',
        permission: ['DASHBOARD'],
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
          { validator: validateAvatar }
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
    handleDialogOpen () {
      this.getAllMenu()
        .then((res) => {
          const { result, status } = res.data;
          if (status === 0) {
            this.menuList = result;
          }
        });
    },
    closeAddPermissionDialog () {
      this.$emit('closeAddPermissionDialog');
    },
    cancelPermissionDialog (formName) {
      this.$refs[formName].resetFields();
      this.addPermissionModel = {
        account: '',
        password: '',
        name: '',
        mobile: '',
        avatar: '',
        permission: ['DASHBORAD'],
        role: 'COMMON'
      };
      this.closeAddPermissionDialog();
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
  }
};
</script>

<style lang="scss" scoped>
.add-permission-dialog {
  /deep/.el-dialog {
    .el-dialog__header {
      position: relative;
      z-index: 10;
      box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.2);
    }
    .el-dialog__body {
      height: 60vh;
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
      box-shadow: 0px -5px 5px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
