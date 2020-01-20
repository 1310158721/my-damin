import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import asyncMenuRoutes from './asyncMenuRoutes';
import $axios from 'axios';
import jsCookie from 'js-cookie';
import notMenuRoutes from './notMenuRoutes';
import devRoutes from './devRoutes';

if (process.env.NODE_ENV === 'development') {
  asyncMenuRoutes.push(...devRoutes);
}

import NProgress from 'nprogress'; // 页面加载进度条
import 'nprogress/nprogress.css';
import Axios from 'axios';

// NProgress 的简单配置
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

const asyncMenuRoutesFirst = asyncMenuRoutes[0];

Vue.use(VueRouter);

// 固定路由
const routes = [
  {
    path: '/',
    name: 'root',
    redirect: {
      path: '/baseLayout'
    }
  },
  {
    path: '/Login',
    name: 'Login',
    meta: {
      title: 'Login'
    },
    component: () => import('@/layout/login')
  }
];

const router = new VueRouter({
  routes
});

// 根据接口返回的title值来匹配路由
const getAsyncRoutes = item => {
  if (item.children && item.children.length) {
    item.children.map(k => {
      getAsyncRoutes(k);
    });
  } else {
    // 匹配title一致的路由
    const match = asyncMenuRoutes.filter(f => f.meta.title === item.title);
    if (match.length) {
      asyncMenuRoutesFirst.children.push(match[0]);
      // 为接口获取的result的每一个导航添加path属性，方便后期当行菜单点击跳转
      item.path = match[0].path;
      item.title = match[0].meta.title;
    }
  }
};

/**
 * 获取单用户信息接口
 */
function getSingleUser () {
  return $axios.get('/getSingleUser');
};

/**
 * 获取权限菜单信息
 */
function getMenuList() {
  return $axios.get('/getMenuList')
};

let cacheRoutes = jsCookie.get('cacheRoutes') ? JSON.parse(jsCookie.get('cacheRoutes')) : [ { path: '/Dashboard', title: 'Dashboard' } ];

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;

  NProgress.start();

  // 判断当前用户是否还在登录状态
  const token = jsCookie.get('token');

  // 若用户处于登录状态（即有Token时）
  if (token) {
    // 若跳转的是Login，则重新跳转至Dashboard
    if (to.path === '/Login') {
      document.title = to.meta.title;
      next({
        path: '/Dashboard',
        replace: true
      });
      // 跳转的不是Login/LoginOut时(暂时没有LoginOut页面)
    } else if (to.path !== '/LoginOut') {
      // 若 vuex 上的menuList 没有值，则调取接口获取值
      if (!store.state.menuList.length) {
        // axios 并发优化处理
        $axios.all([getSingleUser(), getMenuList()])
          .then($axios.spread((singleUser, allMenu) => {
            const singleUserStatus = singleUser.data.status;
            const singleUserResult = singleUser.data.result;
            const allMenuStatus = allMenu.data.status;
            const allMenuResult = allMenu.data.result;
            if (singleUserStatus === 0) {
              store.commit('SETUSERINFO', singleUserResult);
            }
            if (allMenuStatus === 0) {
              const { list } = allMenuResult;
              if (process.env.NODE_ENV === 'development') {
                list.push({
                  title: '方便测试',
                  icon: 'icon-ceshi',
                  children: null
                });
              }
              // 遍历获取菜单栏对应的路由以及重新处理菜单栏的数据（为每一项添加一个path属性）
              list.map(i => {
                getAsyncRoutes(i);
              });
              // vuex 保存处理好的 菜单栏数据
              store.commit('RESETMENULIST', list);
              // router 添加处理好的路由数据
              router.addRoutes([asyncMenuRoutesFirst, ...notMenuRoutes]);
              // 跳转路由
              next({
                path: to.fullPath,
                replace: true
              });
            }
          }))
      } else {
        cacheRoutes = jsCookie.get('cacheRoutes') ? JSON.parse(jsCookie.get('cacheRoutes')) : [];
        if (!cacheRoutes.filter((i) => i.path === to.path).length && !to.meta.isNotMenu) {
          cacheRoutes = [...cacheRoutes, { path: to.path, title: to.meta && to.meta.title }];
        }
        jsCookie.set('cacheRoutes', JSON.stringify(cacheRoutes));
        next();
      }
    }
    // 用户处于无登录状态时
  } else {
    // 当跳转的不是登录页面时，则重新跳转至登录页面
    if (to.path !== '/Login') {
      next({
        path: '/Login',
        replace: true
      });
    } else {
      next();
    }
  }
});

// 进入路由后钩子
router.afterEach(() => {
  NProgress.done();
});

export default router;
