const asyncMenuRoutes = [
  {
    path: '/baseLayout',
    name: 'baseLayout',
    meta: {
      title: 'baseLayout'
    },
    component: () => import('@/layout/base'),
    redirect: {
      path: '/Dashboard'
    },
    children: []
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    meta: {
      title: 'Dashboard'
    },
    component: () => import('@/views/Dashboard/Dashboard'),
    children: null
  },
  {
    path: '/WaitingTodo',
    name: 'WaitingTodo',
    meta: {
      title: '待办列表'
    },
    component: () => import('@/views/WaitingTodo/WaitingTodo'),
    children: null
  },
  {
    path: '/NestedRoutes-1-1',
    name: 'NestedRoutes-1-1',
    meta: {
      title: '路由-1-1'
    },
    component: () => import('@/views/NestedRoutes/NestedRoutes-1-1'),
    children: null
  },
  {
    path: '/NestedRoutes-1-3',
    name: 'NestedRoutes-1-3',
    meta: {
      title: '路由-1-3'
    },
    component: () => import('@/views/NestedRoutes/NestedRoutes-1-3'),
    children: null
  },
  {
    path: '/NestedRoutes-1-2-1',
    name: 'NestedRoutes-1-2-1',
    meta: {
      title: '路由-1-2-1'
    },
    component: () => import('@/views/NestedRoutes/NestedRoutes-1-2-1'),
    children: null
  },
  {
    path: '/NestedRoutes-1-2-2',
    name: 'NestedRoutes-1-2-2',
    meta: {
      title: '路由-1-2-2'
    },
    component: () => import('@/views/NestedRoutes/NestedRoutes-1-2-2'),
    children: null
  },
  {
    path: '/NestedRoutes-1-2-3',
    name: 'NestedRoutes-1-2-3',
    meta: {
      title: '路由-1-2-3'
    },
    component: () => import('@/views/NestedRoutes/NestedRoutes-1-2-3'),
    children: null
  },
  {
    path: '/NestedRoutes-2',
    name: 'NestedRoutes-2',
    meta: {
      title: '路由-2'
    },
    component: () => import('@/views/NestedRoutes/NestedRoutes-2'),
    children: null
  },
  {
    path: '/PermissionMenu',
    name: 'PermissionMenu',
    meta: {
      title: '权限菜单'
    },
    component: () => import('@/views/Permission/Menu/Menu'),
    children: null
  }
];

export default asyncMenuRoutes;
