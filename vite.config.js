import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import UnoCSS from "unocss/vite";

import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    AutoImport({
      // 导入 Vue 函数，如：ref, reactive, toRef 等
      imports: ["vue", "pinia", "vue-router"],
      // [ElementPlusResolver({ importStyle: "sass" })] 的前提是要安装sass
      resolvers: [ElementPlusResolver()],

      // 自动生成 eslint 规则，解决未定义变量报错问题
      eslintrc: {
        enabled: true, // 是否自动生成 eslint 规则，建议生成之后设置 false
        filepath: "./.eslintrc-auto-import.json", // 指定自动导入函数 eslint 规则的文件
        globalsPropValue: true,
      },

      vueTemplate: true, //允许在 .vue 模板中使用自动导入的函数
      //  dts: false,
      // dts: "src/types/auto-imports.d.ts", // 指定自动导入函数TS类型声明文件路径
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      // 指定自定义组件位置(默认:src/components)
      dirs: ["src/components", "src/**/components"],
      //  dts: false,
      // dts: "src/types/components.d.ts", // 指定自动导入组件TS类型声明文件路径
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      // 定义全局 SCSS 变量
      scss: {
        api: "modern-compiler",
        // 在 每个 .scss 文件或者组件的 <style lang="scss">  编译前，自动插入这一行代码。
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },

  server: {
    host: true,
    port: 3006,
    open: true,
    https: false,
    cors: true,
    proxy: {
      "/dev-api": {
        target: "http://192.168.1.251:7005/apiProxy",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, ""),
      },
    },
  },
});
