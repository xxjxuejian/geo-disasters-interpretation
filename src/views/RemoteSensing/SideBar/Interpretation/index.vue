<script setup>
import VecEdit from "./components/VecEdit.vue";
import LandSlideIdentify from "./components/LandSlideIdentify.vue";

const currentViewMap = {
  VecEdit,
  LandSlideIdentify,
};

const currentView = ref(""); // 当前显示的组件

// 切换识别算法
const handleChangeModel = () => {
  currentView.value = "LandSlideIdentify";
};

// 切换基础工具
const handleChangeTool = () => {
  currentView.value = "VecEdit";
};

const handleBack = () => {
  currentView.value = "";
};
</script>

<template>
  <div class="interpretation">
    <!-- 功能区 -->
    <div v-if="!currentView">
      <div class="p-2 mb-4">
        <div class="title mb-2">AI解译</div>
        <div class="">
          <el-button type="info" @click="handleChangeModel">滑坡识别</el-button>
        </div>
      </div>

      <div class="p-2 mb-4">
        <div class="title mb-2">基础处理</div>
        <div>
          <el-button type="info" @click="handleChangeTool">矢量编辑器</el-button>
        </div>
      </div>
    </div>

    <!-- 显示组件区 -->
    <component :is="currentViewMap[currentView]" v-else @back="handleBack" />
  </div>
</template>

<style lang="scss" scoped>
.interpretation {
  border: 1px solid red;
}
</style>
