// src/composables/useMeasurement.js
import { ref, computed } from "vue";
import { useMapStore } from "@/stores/modules/mapStore";

// OpenLayers imports
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import { getLength } from "ol/sphere";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";

export function useMeasurement() {
  const mapStore = useMapStore();
  const map = computed(() => mapStore.mapInstance);

  const isMeasuring = ref(false);
  const measurementResult = ref("");

  // 这些变量只存在于这个 composable 的闭包中
  let drawInteraction = null;
  let measurementLayer = null;

  const startMeasurement = () => {
    if (!map.value || isMeasuring.value) return;

    const source = new VectorSource();
    measurementLayer = new VectorLayer({
      source: source,
      style: new Style({
        stroke: new Stroke({
          color: "#ffcc33",
          width: 3,
        }),
      }),
    });

    map.value.addLayer(measurementLayer);

    drawInteraction = new Draw({
      source: source,
      type: "LineString",
    });

    drawInteraction.on("drawstart", () => {
      source.clear();
      measurementResult.value = "计算中...";
    });

    drawInteraction.on("drawend", (event) => {
      const geometry = event.feature.getGeometry();
      const length = getLength(geometry, { projection: map.value.getView().getProjection() });
      measurementResult.value = `距离: ${(length / 1000).toFixed(2)} km`;
    });

    map.value.addInteraction(drawInteraction);
    isMeasuring.value = true;
  };

  const stopMeasurement = () => {
    if (!map.value || !isMeasuring.value) return;

    map.value.removeInteraction(drawInteraction);
    map.value.removeLayer(measurementLayer);

    drawInteraction = null;
    measurementLayer = null;

    isMeasuring.value = false;
    measurementResult.value = "";
  };

  // 返回响应式状态和方法，供组件使用
  return {
    isMeasuring,
    measurementResult,
    startMeasurement,
    stopMeasurement,
  };
}
