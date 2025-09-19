import { setupElIcons } from "./ele-icons";
import { setupPinia } from "@/stores/index";
import { setupRouter } from "@/router/index";

export default {
  install(app) {
    // Element-plus图标
    setupElIcons(app);
    // 状态管理(store)
    setupPinia(app);
    // 路由(router)
    setupRouter(app);
  },
};
