<template>
  <div class="waiting-to-do-wrapper">
    <div class="conditions-wrapper">
      <el-button size="small" type="success" class="mgr-20" @click='addItem'
        >新增待办事件</el-button
      >
      <el-date-picker
        class="mgr-20"
        v-model="timeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        @change="timePickerChange"
        :picker-options="pickerOptions"
      />
      <el-select size="small" clearable v-model="params.level" @change='levelChange' placeholder="请选择用户权限级别">
        <el-option
          v-for="item in enumLevel"
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
      <el-table :data="list" v-loading='isloading' stripe border height="100%">
        <el-table-column label="CreatedTime" align="center" width="200px">
          <template slot-scope="scope">
            <span>
              {{ scope.row.createdTime | formatCreatedTime }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="Content"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="level"
          label="Level"
          align="center"
          width="120px"
        >
          <template slot-scope="scope">
            <el-tag effect="dark" size='mini' type="danger" v-if='scope.row.level === 1'>{{ scope.row.level | formatLevel }}</el-tag>
            <el-tag effect="dark" size='mini' type="warning" v-if='scope.row.level === 2'>{{ scope.row.level | formatLevel }}</el-tag>
            <el-tag effect="dark" size='mini' type="info" v-if='scope.row.level === 3'>{{ scope.row.level | formatLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Operation" align="center" width="200px">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click.native='deleteItem(scope.row._id)'>delete</el-button>
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
        :total="count"
      >
      </el-pagination>
    </div>
    <AddWaitingDialog
      :addWaitingDialog='addWaitingDialog'
      @closeAddWaitingDialog='closeAddWaitingDialog'
    />
  </div>
</template>

<script>
import { $formDate } from "@/assets/js/utils";
import AddWaitingDialog from './components/AddListItemDialog';
export default {
  name: "WaitingTodo",
  components: {
    AddWaitingDialog
  },
  props: {},
  data() {
    return {
      theTimeRange: null,
      pickerOptions: {
        disabledDate(date) {
          return date > Date.now();
        }
      },
      params: {
        page: 1,
        size: 20,
        startTime: null,
        endTime: null,
        keyword: null,
        level: null
      },
      isloading: false,
      count: null,
      list: null,
      addWaitingDialog: false
    };
  },
  computed: {
    timeRange: {
      get() {
        return this.theTimeRange;
      },
      set(val) {
        if (!val) {
          this.params.startTime = null;
          this.params.ednTime = null;
          this.theTimeRange = null;
        } else {
          this.theTimeRange = val;
          this.params.startTime = $formDate(val[0], "yyyy-MM-dd");
          this.params.endTime = $formDate(val[1], "yyyy-MM-dd");
        }
      }
    },
    enumLevel() {
      return [
        { label: "一级", value: 1 },
        { label: "二级", value: 2 },
        { label: "三级", value: 3 }
      ];
    }
  },
  methods: {
    getWaitingList() {
      this.isloading = true;
      this.$axios
        .get("/getWaitingList", { params: this.params })
        .then(res => {
          const { status, result } = res.data;
          if (status === 0) {
            this.isloading = false;
            const { count, list } = result;
            this.count = count;
            this.list = list;
          }
        });
    },
    async deleteWaitingItem(params) {
      return this.$axios.get('/deleteWaitingItem', { params });
    },
    timePickerChange() {
      this.params.keyword = null;
      this.params.level = null;
      this.getWaitingList();
    },
    levelChange(val) {
      this.params.startTime = null;
      this.params.endTime = null;
      this.theTimeRange = null;
      this.params.keyword = null;
      if (!val) {
        this.params.level = null;
      }
      this.getWaitingList();
    },
    sureKeyword() {
      this.params.startTime = null;
      this.params.endTime = null;
      this.theTimeRange = null;
      this.params.level = null;
      this.getWaitingList();
    },
    // 分页器 size 改变
    handleSizeChange(val) {
      this.params.size = val;
      this.getWaitingList();
    },
    // 分页器 page 改变
    handleCurrentChange(val) {
      this.params.page = val;
      this.getWaitingList();
    },
    addItem() {
      this.addWaitingDialog = true;
    },
    closeAddWaitingDialog(boolean) {
      this.addWaitingDialog = false;
      if (boolean) {
        this.getWaitingList();
      }
    },
    deleteItem(_id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteWaitingItem({ _id })
            .then((res) => {
              const { status } = res.data;
              if (status === 0) {
                this.getWaitingList();
              }
            })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    }
  },
  filters: {
    formatCreatedTime(date) {
      return $formDate(new Date(date), "yyyy-MM-dd hh:mm:ss");
    },
    formatLevel(val) {
      switch(val) {
        case 1:
          return '一级';
        case 2:
          return '二级';
        case 3:
          return '三级';
        default:
          return '--';
      }
    }
  },
  created() {
    this.getWaitingList();
  },
  mounted() {},
  watch: {}
};
</script>

<style lang="scss" scoped>
.waiting-to-do-wrapper {
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
    /deep/.el-table {
    }
  }
  .pagination-wrapper {
    height: 32px;
    .el-pagination {
      float: right;
    }
  }
}
</style>
