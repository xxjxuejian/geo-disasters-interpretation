import { computed, shallowRef } from "vue";
import pinia from "../index";

export const useMapStore = defineStore("map", () => {
  // 用来存储 Map 的实例
  const mapInstance = shallowRef(null);
  // 用来存储当前激活的图层实例
  const activeImgLayer = shallowRef(null);
  // 用来存储当前激活的矢量图层实例，全局仅维持一个矢量图层
  const activeVecLayer = shallowRef(null);

  const activeVecSource = computed(() => {
    return activeVecLayer.value ? activeVecLayer.value.getSource() : null;
  });

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

  // 保存当前激活矢量图层
  function setActiveVecLayer(layer) {
    if (mapInstance.value) {
      activeVecLayer.value = layer;
    }
  }

  function getActiveVecSource() {
    return activeVecLayer.value?.getSource();
  }

  // 重置矢量图层
  function resetActiveVectorLayer() {
    // 如果图层存在就清除数据源
    if (activeVecLayer.value) {
      activeVecLayer.value.getSource()?.clear();
    }
    console.log("重置矢量图层");
  }

  function addFeature(feature) {
    activeVecLayer.value.getSource()?.addFeature(feature);
  }

  function addFeatures(features) {
    activeVecLayer.value.getSource()?.addFeatures(features);
  }

  return {
    mapInstance,
    activeImgLayer,
    activeVecLayer,
    activeVecSource,
    setMapInstance,
    setActiveImgLayer,
    clearActiveImgLayer,
    setActiveVecLayer,
    resetActiveVectorLayer,
    getActiveVecSource,
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
