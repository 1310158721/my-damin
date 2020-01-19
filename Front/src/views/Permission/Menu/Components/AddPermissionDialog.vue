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
        <el-select size='small' v-model="addPermissionModel.role" placeholder="请选择">
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
          check-on-click-node
          default-expand-all
          check-strictly
          :default-checked-keys="['DASHBOARD']"
          expand-on-click-node
          @node-click="nodeClick"
          :props="defaultProps"
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
        permission: '',
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
      },
      roleOptions: [
        { label: '普通用户', value: 'COMMON' },
        { label: '管理员', value: 'ADMIN' },
        { label: '超级管理员', value: 'SUPERADMIN' }
      ]
    };
  },
  computed: {},
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
    cancelPermissionDialog (formName) {
      this.$refs[formName].resetFields();
      this.addPermissionModel = {};
      this.closeAddPermissionDialog();
    },
    surePermissionDialog (formName) {
      this.$refs[formName].validate((valid) => {
          if (valid) {
            let selectPermissionKey = this.$refs.tree.getCheckedKeys();
            selectPermissionKey = selectPermissionKey.filter(i => i).join(',');
            this.addPermissionModel.permission = selectPermissionKey;
            this.addSingleUser(this.addPermissionModel)
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
    }
  },
  created () {},
  mounted () {},
  watch: {}
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
      height: 420px;
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
