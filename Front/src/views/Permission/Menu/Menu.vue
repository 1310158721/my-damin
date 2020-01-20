<template>
  <div class="permission-menu-wrapper">
    <div class="conditions-wrapper">
      <el-button size='small' type='success' @click='addItem' class="mgr-20">新增用户</el-button>
      <el-date-picker
        class="mgr-20"
        v-model="timeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        @change="timePickerChange"
        :picker-options='pickerOptions'
      />
      <el-select v-if='$store.state.userInfo.role === "SUPERADMIN"' size="small" clearable v-model="params.roleLevel" @change='roleLevelChange' placeholder="请选择用户权限级别">
        <el-option
          v-for="item in roleEnum"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span class="auto-flex"></span>
      <SearchBar
        class="search-bar"
        placeholder="Name/Mobile"
        v-model="params.keyword"
        @sureKeyword="sureKeyword"
      />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="userInfos"
        stripe
        border
        height='100%'
        v-loading="!userInfos"
      >
        <el-table-column label="CreatedTime" align='center'>
          <template slot-scope="scope">
            <span>{{ scope.row.createdTime | formatCreatedTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" align='center' />
        <el-table-column prop="mobile" label="Mobile" align='center'>
          <template slot-scope="scope">
            <span>{{ scope.row.mobile || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleDesc" label="Role" align='center' />
        <el-table-column label="Opertion" align='center' v-if='$hasPermission("PERMISSIONMENUEDIT,PERMISSIONMENUDELETE")'>
          <template slot-scope="scope">
            <el-button size='mini' type='primary' @click.native='handleEdit(scope.row._id)' v-permission="'PERMISSIONMENUEDIT'">edit</el-button>
            <el-button size='mini' type='danger' :disabled='scope.row.role === "SUPERADMIN"' @click.native='handleDelete(scope.row._id)' v-permission="'PERMISSIONMENUDELETE'">delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.page"
        :page-sizes="[20, 30, 50]"
        :page-size="params.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count">
      </el-pagination>
    </div>
    <!-- 编辑弹窗 -->
    <EditPermissionDialog
      :editPermissionDialog='editPermissionDialog'
      :id='id'
      @closePermissionDialog='closePermissionDialog'
    />
    <!-- 新增弹窗 -->
    <AddPermissionDialog
      :addPermissionDialog='addPermissionDialog'
      @closeAddPermissionDialog='closeAddPermissionDialog'
      @surePermissionDialog='surePermissionDialog'
    />
  </div>
</template>

<script>
import { $formDate } from '@/assets/js/utils';
import EditPermissionDialog from './Components/EditPermissionDialog';
import AddPermissionDialog from './Components/AddPermissionDialog';
export default {
  name: 'PermissionMenu',
  components: {
    EditPermissionDialog,
    AddPermissionDialog
  },
  props: {},
  data () {
    return {
      userInfos: null,
      count: 0,
      theTimeRange: null,
      params: {
        page: 1,
        size: 20,
        startTime: null,
        endTime: null,
        keyword: null,
        roleLevel: null
      },
      pickerOptions: {
        disabledDate (date) {
          return date > Date.now();
        }
      },
      id: null,
      editPermissionDialog: false,
      addPermissionDialog: false
    };
  },
  computed: {
    timeRange: {
      get () {
        return this.theTimeRange;
      },
      set (val) {
        if (!val) {
          this.params.startTime = null;
          this.params.ednTime = null;
          this.theTimeRange = null;
        } else {
          this.theTimeRange = val;
          this.params.startTime = $formDate(val[0], 'yyyy-MM-dd');
          this.params.endTime = $formDate(val[1], 'yyyy-MM-dd');
        }
      }
    },
    roleEnum () {
      return [
        { value: 'COMMON', label: '普通用户' },
        { value: 'ADMIN', label: '管理员' },
        { value: 'SUPERADMIN', label: '超级管理员' }
      ];
    }
  },
  methods: {
    // 获取用户列表
    getAllUserInfo () {
      this.$axios.get('/getAllUserInfo', { params: this.params })
        .then(res => {
          const { result, status } = res.data;
          if (status === 0) {
            const { list, count } = result;
            this.count = count;
            this.userInfos = list;
          }
        });
    },
    // 删除单个用户
    async deleteSingleUserById (params) {
      return await this.$axios.get('/deleteSingleUserById', { params });
    },
    // 分页器 size 改变
    handleSizeChange (val) {
      this.params.size = val;
      this.getAllUserInfo();
    },
    // 分页器 page 改变
    handleCurrentChange (val) {
      this.params.page = val;
      this.getAllUserInfo();
    },
    // 编辑用户事件
    handleEdit (id) {
      this.id = id;
      this.editPermissionDialog = true;
    },
    // 删除用户事件
    handleDelete (_id) {
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteSingleUserById({_id})
        .then((res) => {
          const { status } = res.data;
          if (status === 0) {
            this.getAllUserInfo();
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    // 编辑弹窗回调
    closePermissionDialog () {
      this.editPermissionDialog = false;
    },
    // 新增用户
    addItem () {
      this.addPermissionDialog = true;
    },
    // 新增弹窗取消回调
    closeAddPermissionDialog () {
      this.addPermissionDialog = false;
    },
    // 新增弹窗确定回调
    surePermissionDialog () {
      this.addPermissionDialog = false;
      this.getAllUserInfo();
    },
    // datePicker 改变事件
    timePickerChange () {
      this.params.keyword = null;
      this.params.roleLevel = null;
      this.getAllUserInfo();
    },
    // 级别选择框改变
    roleLevelChange (val) {
      this.params.startTime = null;
      this.params.endTime = null;
      this.theTimeRange = null;
      this.params.keyword = null;
      if (!val) {
        this.params.roleLevel = null;
      }
      this.getAllUserInfo();
    },
    // 关键字搜索改变
    sureKeyword () {
      this.params.startTime = null;
      this.params.endTime = null;
      this.theTimeRange = null;
      this.params.roleLevel = null;
      this.getAllUserInfo();
    }
  },
  filters: {
    formatCreatedTime (date) {
      return $formDate(new Date(date), 'yyyy-MM-dd hh:mm:ss');
    }
  },
  created () {
    this.getAllUserInfo();
  },
  mounted () {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.permission-menu-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  .conditions-wrapper {
    height: 32px;
    display: flex;
    flex-direction: row;
    .auto-flex {
      flex: 1;
    }
  }
  .table-wrapper {
    flex: 1;
    height: 100%;
    margin: 15px 0;
  }
  .pagination-wrapper {
    height: 32px;
    .el-pagination {
      float: right;
    }
  }
}
</style>
