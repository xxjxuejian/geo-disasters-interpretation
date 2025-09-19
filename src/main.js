import { createApp } from "vue";
import App from "./App.vue";
import "virtual:uno.css";

import setupPlugins from "@/plugins/index";

const app = createApp(App);

// 注册插件
app.use(setupPlugins);

app.mount("#app");
