import { useMapStoreHook } from "@/stores/index";

const mapStore = useMapStoreHook();

// 切换视角,限定config类型
export function flyTo(config = {}) {
  if (!mapStore.mapInstance) return;
  const view = mapStore.mapInstance.getView();
  view.animate({
    ...config,
    zoom: 15,
    rotation: undefined,
    duration: 1500,
  });
}

export function flyToVec() {
  if (mapStore.activeVecLayer) {
    const extent = mapStore.activeVecLayer.getSource().getExtent();
    mapStore.mapInstance.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 14 });
  }
}
