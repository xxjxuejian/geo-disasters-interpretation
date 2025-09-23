<script setup>
// defineEmits 用于声明该组件会触发哪些事件
const emit = defineEmits(["navigate"]);
</script>

<!-- src/components/TopNavbar.vue -->
<template>
  <header class="top-navbar">
    <button @click="emit('navigate', 'data-input')">数据输入</button>
    <button @click="emit('navigate', 'inter-toolbox')">解译工具箱</button>
    <button @click="emit('navigate', 'data-output')">数据输出</button>
  </header>
</template>

<style scoped>
.top-navbar {
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: center;
  height: 70px;
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.top-navbar button {
  padding: 8px 12px;
  margin-right: 10px;
  cursor: pointer;
}
</style>
