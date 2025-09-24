<script setup>
const emit = defineEmits(["back"]);

const handleGoBack = () => {
  emit("back");
};
</script>

<template>
  <div>
    <!-- 顶部返回导航 -->
    <div class="flex-y-center">
      <el-icon class="cursor-pointer" @click="handleGoBack"><Back /></el-icon>
      <span class="ml-4">滑坡识别</span>
    </div>

    <!-- 内容区 -->
    <div></div>
  </div>
</template>

<style lang="scss" scoped></style>
