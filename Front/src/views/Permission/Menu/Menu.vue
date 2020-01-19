<template>
  <div class="permission-menu-wrapper">
    <div class="conditions-wrapper">
      <el-button size='small' type='success' @click='addItem'>新增用户</el-button>
      <span class="auto-flex"></span>
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
        <el-table-column label="Opertion" align='center'>
          <template slot-scope="scope">
            <el-button size='mini' type='primary' @click.native='handleEdit(scope.row._id)'>edit</el-button>
            <el-button size='mini' type='danger' @click.native='handleDelete(scope.row._id)'>delete</el-button>
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
    <EditPermissionDialog
      :editPermissionDialog='editPermissionDialog'
      :id='id'
      @closePermissionDialog='closePermissionDialog'
    />
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
      params: {
        page: 1,
        size: 20
      },
      id: null,
      editPermissionDialog: false,
      addPermissionDialog: false
    };
  },
  computed: {},
  methods: {
    getAllUserInfo (params) {
      this.$axios.get('/getAllUserInfo', { params })
        .then(res => {
          const { result, status } = res.data;
          if (status === 0) {
            const { list, count } = result;
            this.count = count;
            this.userInfos = list;
          }
        });
    },
    async deleteSingleUserById (params) {
      return await this.$axios.get('/deleteSingleUserById', { params });
    },
    handleSizeChange (val) {
      this.params.size = val;
      this.getAllUserInfo(this.params);
    },
    handleCurrentChange (val) {
      this.params.page = val;
      this.getAllUserInfo(this.params);
    },
    handleEdit (id) {
      this.id = id;
      this.editPermissionDialog = true;
    },
    handleDelete (_id) {
      this.deleteSingleUserById({_id})
        .then((res) => {
          const { status } = res.data;
          if (status === 0) {
            this.getAllUserInfo();
          }
        });
    },
    closePermissionDialog () {
      this.editPermissionDialog = false;
    },
    addItem () {
      this.addPermissionDialog = true;
    },
    closeAddPermissionDialog () {
      this.addPermissionDialog = false;
    },
    surePermissionDialog () {
      this.addPermissionDialog = false;
      this.getAllUserInfo();
    }
  },
  filters: {
    formatCreatedTime (date) {
      return $formDate(new Date(date), 'yyyy-MM-dd hh:mm:ss');
    }
  },
  created () {
    this.getAllUserInfo(this.params);
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
