// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 全局注册Element Plus图标组件，安装 npm install @element-plus/icons-Vue
// 根据项目中对Element Plus图标组件的使用量决定，如果是用的比较多，建议全局注册
// 如果只是偶尔使用几个图标，建议按需引入，以减少打包体积

export function setupElIcons(app) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}
