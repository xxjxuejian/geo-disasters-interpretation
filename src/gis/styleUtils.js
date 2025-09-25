// utils/styleUtils.js
import { Style, Fill, Stroke } from "ol/style.js";

/**
 * 获取矢量图层样式
 */
export function getVectorLayerStyle() {
  return new Style({
    fill: new Fill({
      color: "rgba(49, 48, 48, 0.2)",
    }),
    stroke: new Stroke({
      color: "#f50f0fff",
      width: 2,
      lineDash: [10, 5],
    }),
  });
}
