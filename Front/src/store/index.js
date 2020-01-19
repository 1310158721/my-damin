import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    menuList: [],
    userInfo: null,
    isFixedSystemAside: true,
    isFixedHeader: true,
    isShowSystemTabView: true,
    layoutConfigDrawer: false,
  },
  mutations: {
    RESETMENULIST (state, data) {
      state.menuList = data;
    },
    // 重置 vuex 中的 layoutConfigDrawer(系统布局抽屉)
    SETLAYOUTCONFIGDRAWER (state, boolean) {
      state.layoutConfigDrawer = boolean;
    },
    SETUSERINFO(state, data) {
      state.userInfo = data;
    }
  },
  actions: {
  },
  modules: {
  }
});
