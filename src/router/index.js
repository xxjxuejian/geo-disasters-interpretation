import { createRouter, createWebHashHistory } from "vue-router";

import RemoteSensing from "../views/RemoteSensing/index.vue";

const constantRoutes = [
  {
    path: "/",
    redirect: "/remote_sensing",
  },
  {
    path: "/remote_sensing",
    name: "RemoteSensing",
    component: RemoteSensing,
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app) {
  app.use(router);
}

export default router;
