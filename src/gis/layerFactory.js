// utils/layerFactory.js
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { useMapStoreHook } from "@/stores/modules/mapStore";

const mapStore = useMapStoreHook();
/**
 * 创建 WMS 图层
 * @param {string} wmsUrl - WMS 图层名称
 */
export function createWMSLayer(wmsUrl = "LYN:LPQ3857") {
  return new TileLayer({
    source: new TileWMS({
      url: "http://192.168.1.253:8080/geoserver/wms/",
      params: {
        VERSION: "1.1.0",
        REQUEST: "GetMap",
        layers: wmsUrl,
      },
      crossOrigin: "anonymous",
      serverType: "geoserver",
    }),
    zIndex: 5,
  });
}

export function addNewImgLayer(wmsUrl = "LYN:LPQ3857") {
  if (!mapStore.mapInstance) return;
  const newLayer = createWMSLayer(wmsUrl);
  mapStore.mapInstance.addLayer(newLayer);
  mapStore.setActiveImgLayer(newLayer);
}
