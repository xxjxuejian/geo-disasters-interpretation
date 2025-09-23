<!-- src/components/MapContainer.vue -->

<script setup>
import { onMounted, ref } from "vue";
import { useMapStore } from "@/stores/modules/mapStore";
// import { initMap } from "@/composables/mapOptions";

import mapUrls from "@/gis/mapUrls";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

const mapStore = useMapStore();
const mapDiv = ref(null);

function initMap(mapEl) {
  if (!mapEl || mapStore.mapInstance) return;

  // 影像底图
  const baseImgLayer = new TileLayer({
    source: new XYZ({
      url: mapUrls["tian-img"],
    }),
    title: "影像底图",
    zIndex: 1,
  });

  // 2.1 添加影像底图的注记
  const labelLayer = new TileLayer({
    source: new XYZ({
      url: mapUrls["tian-label"],
    }),
    title: "道路标记",
    zIndex: 2, // TODO: 道路标记层级要比tif影像图层级要高
  });

  // 创建矢量图层,供后续使用
  const vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    zIndex: 10,
  });

  const map = new Map({
    target: mapEl,
    layers: [baseImgLayer, labelLayer, vectorLayer],
    view: new View({
      projection: "EPSG:4326",
      center: [0, 0],
      zoom: 15,
    }),
  });

  mapStore.setMapInstance(map);
  mapStore.setActiveVecLayer(vectorLayer);

  mapStore.flyTo({
    center: [120.25, 30.4],
  });
}

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
