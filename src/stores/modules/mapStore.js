import { shallowRef } from "vue";
import VectorLayer from "ol/layer/Vector";
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

  // 保存当前激活矢量图层
  function setActiveVecLayer(layer) {
    activeVecLayer.value = layer;
  }

  // 重置矢量图层
  function resetActiveVectorLayer() {
    // 如果图层存在就清除数据源
    if (activeVecLayer.value) {
      activeVecLayer.value.getSource().clear();
    }
    // 如果图层不存在就创建
    else {
      const vecLayer = new VectorLayer({
        zIndex: 10,
      });
      mapInstance.value.addLayer(vecLayer);
      activeVecLayer.value = vecLayer;
    }
    console.log("重置矢量图层");
  }

  // 移除当前激活的影像图层
  function clearActiveImgLayer() {
    if (activeImgLayer.value) {
      mapInstance.value.removeLayer(activeImgLayer.value);
    }
    activeImgLayer.value = null;
  }

  return {
    mapInstance,
    activeImgLayer,
    activeVecLayer,
    setMapInstance,
    setActiveImgLayer,
    clearActiveImgLayer,
    setActiveVecLayer,
    resetActiveVectorLayer,
  };
});

/**
 * 在组件外使用 Pinia store 实例 @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 * 例如一些js文件中使用 Pinia store 实例
 */
export function useMapStoreHook() {
  return useMapStore(pinia);
}
