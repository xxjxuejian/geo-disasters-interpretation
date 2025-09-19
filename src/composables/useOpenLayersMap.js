// src/composables/useOpenLayersMap.js
import { onMounted, onUnmounted } from "vue";
import { useMapStore } from "@/stores/modules/mapStore";
import mapUrls from "@/gis/mapUrls";

// OpenLayers imports
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
// import { XYZ } from "ol/source";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";

/**
 * 负责地图的初始化和销毁。
 * @param {import('vue').Ref<HTMLElement | null>} targetDiv - 地图容器的 DOM 元素引用
 */
export function useOpenLayersMap(targetDiv) {
  const mapStore = useMapStore();

  // 向地图添加一个地图图层
  const createWMSLayer = (wmsUrl = "LYN:LPQ3857") => {
    const layer = new TileLayer({
      source: new TileWMS({
        url: "http://192.168.1.253:8080/geoserver/wms/",
        params: {
          VERSION: "1.1.0",
          REQUEST: "GetMap",
          layers: wmsUrl, // LYN:linping_16db,(地名标记)  LYN:LPQ3857,LYN:lp_water,LYN:osm_lp,LYN:lp_vegetatin
        },
        // zIndex: 10, // TileWMS 没有这个属性
        crossOrigin: "anonymous",
        serverType: "geoserver",
      }),
      zIndex: 10,
    });
    return layer;
  };

  const initMap = () => {
    if (!targetDiv.value || mapStore.mapInstance) return;

    //1. 创建地图实例
    const map = new Map({
      target: targetDiv.value,
      view: new View({
        projection: "EPSG:4326",
        center: [0, 0],
        zoom: 12,
      }),
    });

    // 2. 创建天地图影像地图
    const baseImgLayer = new TileLayer({
      source: new XYZ({
        url: mapUrls["tian-img"],
      }),
      title: "影像底图",
      zIndex: 1,
    });
    map.addLayer(baseImgLayer);

    // 2.1 添加影像地图的标记
    const labelLayer = new TileLayer({
      source: new XYZ({
        url: mapUrls["tian-label"],
      }),
      title: "道路标记",
      zIndex: 11, // TODO: 道路标记层级要比tif影像图层级要高
    });
    map.addLayer(labelLayer);

    // 临平区的影像图层 LYN:LPQ3857 120.25, 30.4
    //   118.35, 32.28 HC:testA
    // const newWMSLayer = createWMSLayer("HC:testA");
    // map.addLayer(newWMSLayer);

    // 设置视角
    map.getView().animate({
      // 只设置需要的属性即可
      center: [120.25, 30.4], // 中心点
      zoom: 15, // 缩放级别
      rotation: undefined, // 缩放完成view视图旋转弧度
      duration: 1000, // 缩放持续时间，默认不需要设置
    });

    // 4. 将创建的实例注册到 Pinia Store
    mapStore.setMapInstance(map);
    // mapStore.registerLayer("baseImage", baseImgLayer);
  };

  const destroyMap = () => {
    if (mapStore.mapInstance) {
      mapStore.mapInstance.setTarget(null);
    }
  };

  // 在组件挂载时初始化地图
  onMounted(() => {
    initMap();
    // addWMSLayer();
  });

  // 在组件卸载时清理地图，防止内存泄漏
  onUnmounted(destroyMap);
}
