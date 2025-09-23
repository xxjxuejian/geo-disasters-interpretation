<script setup>
import TopNavBar from "./TopNavBar/index.vue";
import DataInput from "./SideBar/DataInput/index.vue";
import Interpretation from "./SideBar/Interpretation/index.vue";
import DataOutput from "./SideBar/DataOutput/index.vue";
import MAP from "./Map/index.vue";
import { useMapStore } from "@/stores/modules/mapStore";

const mapStore = useMapStore();
const activeSidebar = ref("data-output"); // 控制当前显示的侧边栏内容

// 导航栏点击事件处理函数
const handleNavigation = (sidebarName) => {
  activeSidebar.value = sidebarName;

  mapStore.clearActiveImgLayer();
  mapStore.resetActiveVectorLayer();
};
</script>

<template>
  <div class="remote-sensing-page">
    <!-- 顶部导航栏 -->
    <TopNavBar @navigate="handleNavigation"></TopNavBar>

    <!-- 主体内容区域 -->
    <main class="main-content">
      <!-- 左侧侧边栏 -->
      <aside class="sidebar">
        <DataInput v-if="activeSidebar === 'data-input'"></DataInput>

        <Interpretation v-if="activeSidebar === 'inter-toolbox'" />
        <DataOutput v-if="activeSidebar === 'data-output'" />
      </aside>

      <!-- 右侧地图容器 -->
      <div class="map-container">
        <MAP></MAP>
      </div>
    </main>
  </div>
</template>

<style scoped>
.remote-sensing-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh; /* 占满整个视口高度 */
}

.main-content {
  display: flex;
  flex-grow: 1; /* 占据剩余的所有空间 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 侧边栏容器 */
.sidebar {
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  width: 350px;
  padding: 15px;
  overflow-y: auto; /* 如果内容过多则显示滚动条 */
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

/* 地图容器 */
.map-container {
  flex-grow: 1; /* 占据所有剩余空间 */
  height: 100%;
}
</style>
