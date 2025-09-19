import js from "@eslint/js"; // JavaScript 规则
import globals from "globals";

// Vue支持
import pluginVue from "eslint-plugin-vue"; // Vue 规则
import vueParser from "vue-eslint-parser"; // Vue 解析器

// 代码风格与格式化
import configPrettier from "eslint-config-prettier"; // 禁用与 Prettier 冲突的规则
import prettierPlugin from "eslint-plugin-prettier"; // 运行 Prettier 规则

import { defineConfig } from "eslint/config";

// 解析自动导入配置
import fs from "fs";
let autoImportGlobals = {};
try {
  autoImportGlobals =
    JSON.parse(fs.readFileSync("./.eslintrc-auto-import.json", "utf-8"))
      .globals || {};
} catch (error) {
  // 文件不存在或解析错误时使用空对象
  console.warn("Could not load auto-import globals", error);
}

export default defineConfig([
  // 指定检查文件和忽略文件
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    ignores: ["**/node_modules/**", "**/dist/**", "**/*.min.*"],
  },

  // 全局配置
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...autoImportGlobals,
        // 项目中自定义的全局变量，根据实际情况添加
        ...{
          ResponseData: "readonly",
          ExcelResult: "readonly",
          TagView: "readonly",
          AppSettings: "readonly",
          __APP_INFO__: "readonly",
        },
      },
    },
    plugins: { prettier: prettierPlugin },
    rules: {
      ...configPrettier.rules, // 关闭与 Prettier 冲突的规则
      ...prettierPlugin.configs.recommended.rules, // 启用 Prettier 规则
      "prettier/prettier": "error", // 强制 Prettier 格式化
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_", // 忽略参数名以 _ 开头的参数未使用警告
          varsIgnorePattern: "^[A-Z0-9_]+$", // 忽略变量名为大写字母、数字或下划线组合的未使用警告（枚举定义未使用场景）
          ignoreRestSiblings: true, // 忽略解构赋值中同级未使用变量的警告
        },
      ],
    },
  },

  // 基础 JavaScript 配置
  js.configs.recommended,

  // Vue 配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: { vue: pluginVue },
    processor: pluginVue.processors[".vue"],
    rules: {
      ...pluginVue.configs.recommended.rules, // Vue 推荐规则
      "vue/no-v-html": "off", // 允许 v-html
      "vue/multi-word-component-names": "off", // 允许单个单词组件名
    },
  },

  // Prettier 集成（必须放在最后）
  {
    plugins: {
      prettier: prettierPlugin, // 将 Prettier 的输出作为 ESLint 的问题来报告
    },
    rules: {
      ...configPrettier.rules,
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
]);
