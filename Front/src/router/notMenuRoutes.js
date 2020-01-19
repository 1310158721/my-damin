const notMenuRoutes = [
  {
    path: '/NotMenu',
    name: 'NotMenu',
    meta: {},
    component: () => import('@/layout/notMenu'),
    children: [
      {
        path: '/PersonalCenter',
        name: 'PersonalCenter',
        meta: {
          title: '个人中心',
          isNotMenu: true
        },
        component: () => import('@/views/User/personal'),
        children: null
      }
    ]
  }
];

export default notMenuRoutes;
