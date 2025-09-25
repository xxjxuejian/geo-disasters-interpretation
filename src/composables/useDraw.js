import { useMapStoreHook } from "@/stores/modules/mapStore";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { Draw, Modify, Snap, Select } from "ol/interaction.js";
import { click } from "ol/events/condition.js";
import { Style, Stroke } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON.js";
const mapStore = useMapStoreHook();

const { mapInstance, activeVecSource } = storeToRefs(mapStore);
export function useDraw() {
  const isDrawing = ref(false); // 当前是否正在绘制

  let drawInteraction = null; // 绘制交互实例
  let modifyInteraction = null; // 修改交互实例
  let snapInteraction = null; // 吸附交互实例
  let selectInteraction = null; // 选择交互实例

  /* 
    添加交互: 给地图添加选择与修改交互
        这个交互可以在组件加载完成以后就添加.
   */
  function addInteraction() {
    // 选择交互
    selectInteraction = new Select({
      condition: click,
      style: new Style({
        stroke: new Stroke({
          color: "blue",
          width: 3,
        }),
      }),
    });
    mapInstance.addInteraction(selectInteraction);

    // 修改交互
    modifyInteraction = new Modify({
      features: selectInteraction.getFeatures(),
    });
    mapInstance.addInteraction(modifyInteraction);
  }

  /* 
    开始绘制 : 开始绘制时 添加Draw交互与snap交互
  */
  function startDraw() {
    if (!activeVecSource.value) return;
    drawInteraction = new Draw({
      source: activeVecSource.value,
      type: "Polygon",
    });
    mapInstance.addInteraction(drawInteraction);

    snapInteraction = new Snap({ source: activeVecSource.value });
    mapInstance.addInteraction(snapInteraction);

    isDrawing.value = true;

    drawInteraction.on("drawend", (evt) => {
      console.log("绘制完成:", evt.feature.getGeometry().getCoordinates());
      mapInstance.removeInteraction(drawInteraction);
      drawInteraction = null;
      isDrawing.value = false;
    });
  }

  //   取消绘制
  function cancelDraw() {
    if (drawInteraction) {
      mapInstance.removeInteraction(drawInteraction);
      drawInteraction = null;
      isDrawing.value = false;
    }
  }

  function removeAllInteractions() {
    if (drawInteraction) {
      mapInstance.removeInteraction(drawInteraction);
      drawInteraction = null;
      isDrawing.value = false;
    }
    if (modifyInteraction) {
      mapInstance.removeInteraction(modifyInteraction);
      modifyInteraction = null;
    }
    if (selectInteraction) {
      mapInstance.removeInteraction(selectInteraction);
      selectInteraction = null;
    }
    if (snapInteraction) {
      mapInstance.removeInteraction(snapInteraction);
      snapInteraction = null;
    }
  }

  /* 
    清除当前图层上所有已绘制得矢量,不能删除交互
  */
  function clearAllVector() {
    if (drawInteraction) {
      mapInstance.removeInteraction(drawInteraction);
      drawInteraction = null;
      isDrawing.value = false;
    }
    if (!activeVecSource.value) return;
    activeVecSource.value.clear();
  }

  function delSelectVector() {
    if (!selectInteraction || !activeVecSource.value) return;
    const selectedFeatures = selectInteraction.getFeatures();
    if (selectedFeatures.getLength() > 0) {
      selectedFeatures.forEach((f) => {
        activeVecSource.value.removeFeature(f);
      });
      selectedFeatures.clear();
    }
  }

  return {
    drawInteraction,
    modifyInteraction,
    snapInteraction,
    selectInteraction,
    addInteraction,
    startDraw,
    cancelDraw,
    removeAllInteractions,
    clearAllVector,
    delSelectVector,
  };
}
