import { shallowRef } from "vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { createWMSLayer, getVecLayerStyle } from "@/gis/mapTools.js";
import pinia from "../index";

export const useMapStore = defineStore("map", () => {
  // 用来存储 Map 的实例
  const mapInstance = shallowRef(null);
  // 用来存储当前激活的图层实例
  const activeImgLayer = shallowRef(null);
  // 用来存储当前激活的矢量图层实例，全局仅维持一个矢量图层
  const activeVecLayer = shallowRef(null);

  // 保存 Map 的实例
  function setMapInstance(map) {
    mapInstance.value = map; // 操作 ref/shallowRef 时需要 .value
  }

  // 保存当前激活的影像图层
  function setActiveImgLayer(layer) {
    activeImgLayer.value = layer;
  }

  // 移除当前激活的影像图层
  function clearActiveImgLayer() {
    if (mapInstance.value && activeImgLayer.value) {
      mapInstance.value.removeLayer(activeImgLayer.value);
    }
    activeImgLayer.value = null;
  }

  // 在地图上添加一个新的影像图层
  function addNewImgLayer(wmsUrl = "LYN:LPQ3857") {
    if (!mapInstance.value) return;
    const newLayer = createWMSLayer(wmsUrl);
    mapInstance.value.addLayer(newLayer);
    setActiveImgLayer(newLayer);
  }

  // 保存当前激活矢量图层
  function setActiveVecLayer(layer) {
    if (mapInstance.value) {
      activeVecLayer.value = layer;
    }
  }

  // 重置矢量图层
  function resetActiveVectorLayer() {
    // 如果图层存在就清除数据源
    if (activeVecLayer.value) {
      activeVecLayer.value.getSource()?.clear();
    }
    // 如果图层不存在就创建
    else {
      const vectorSource = new VectorSource();
      const vecLayer = new VectorLayer({
        source: vectorSource,
        zIndex: 10,
      });
      mapInstance.value.addLayer(vecLayer);
      activeVecLayer.value = vecLayer;
    }
    console.log("重置矢量图层");
  }

  function setVecLayerStyle() {
    if (activeVecLayer.value) {
      activeVecLayer.value.setStyle(getVecLayerStyle());
    }
  }

  function addFeature(feature) {
    activeVecLayer.value.getSource()?.addFeature(feature);
  }

  function addFeatures(features) {
    activeVecLayer.value.getSource()?.addFeatures(features);
  }

  // 切换视角,限定config类型
  function flyTo(config = {}) {
    if (!mapInstance.value) return;
    const view = mapInstance.value.getView();
    view.animate({
      ...config,
      zoom: 15,
      rotation: undefined,
      duration: 1500,
    });
  }

  function flyToVec() {
    if (activeVecLayer.value) {
      const extent = activeVecLayer.value.getSource().getExtent();
      mapInstance.value.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 14 });
    }
  }

  return {
    mapInstance,
    activeImgLayer,
    activeVecLayer,
    setMapInstance,
    setActiveImgLayer,
    clearActiveImgLayer,
    addNewImgLayer,
    setActiveVecLayer,
    resetActiveVectorLayer,
    setVecLayerStyle,
    flyTo,
    flyToVec,
    addFeature,
    addFeatures,
  };
});

/**
 * 在组件外使用 Pinia store 实例 @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 * 例如一些js文件中使用 Pinia store 实例
 */
export function useMapStoreHook() {
  return useMapStore(pinia);
}
