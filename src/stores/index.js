import { createPinia } from "pinia";

const pinia = createPinia();

// 全局注册 pinia
export function setupPinia(app) {
  app.use(pinia);
}

export * from "./modules/counter";

export default pinia;
