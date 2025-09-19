<!-- src/components/MapContainer.vue -->

<script setup>
import { onMounted, ref } from "vue";
// import { useOpenLayersMap } from "@/composables/useOpenLayersMap";
import { initMap } from "@/composables/mapOptions";

const mapDiv = ref(null);

// 调用 Composable，将 DOM 引用传递进去，剩下的事情就交给 Composable 处理了
// useOpenLayersMap(mapDiv);
onMounted(() => {
  if (mapDiv.value) {
    initMap(mapDiv.value);
  }
});
</script>

<template>
  <div ref="mapDiv" class="map-container"></div>
</template>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
