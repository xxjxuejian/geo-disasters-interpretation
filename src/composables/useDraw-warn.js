import { ref } from "vue";
import { Draw, Modify, Snap, Select } from "ol/interaction.js";
import { click } from "ol/events/condition.js";
import { Style, Stroke } from "ol/style.js";
import { unByKey } from "ol/Observable.js";

import { useMapStoreHook } from "@/stores/modules/mapStore";
const mapStore = useMapStoreHook();
const { mapInstance, activeVecSource } = storeToRefs(mapStore);

// 传递地图实例与 数据源
// 像 mapInstance、vectorSource 这种初始化时就必须要有的东西，就没必要每次都判空了。
export function useDraw() {
  if (!mapInstance.value || !activeVecSource.value) {
    console.log("asdasdasd", mapInstance.value, activeVecSource.value);
    throw new Error("请传入地图实例与数据源");
  }

  const isDrawing = ref(false); // 当前是否正在绘制

  // 这里使用ref,再组件中无法绘制,不用ref就可以,为什么呢
  let drawInteraction = ref(null); // 绘制交互实例
  let modifyInteraction = ref(null); // 修改交互实例
  let snapInteraction = ref(null); // 吸附交互实例
  let selectInteraction = ref(null); // 选择交互实例

  let drawEndKey = null; //事件 key 保存，方便解绑

  /* 
    添加交互: 给地图添加选择与修改交互
        这个交互可以在组件加载完成以后就添加.
   */
  function addInteraction() {
    // 选择交互
    selectInteraction.value = new Select({
      condition: click,
      style: new Style({
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
      }),
    });
    mapInstance.value.addInteraction(selectInteraction.value);

    // 修改交互
    modifyInteraction.value = new Modify({
      features: selectInteraction.value.getFeatures(),
    });
    mapInstance.value.addInteraction(modifyInteraction.value);

    console.log("addInteraction执行了", selectInteraction.value, modifyInteraction.value);
  }

  /* 
    开始绘制 : 开始绘制时 添加Draw交互与snap交互
  */
  function startDraw(type = "Polygon") {
    drawInteraction.value = new Draw({
      source: activeVecSource.value,
      type: type,
    });
    mapInstance.value.addInteraction(drawInteraction.value);

    snapInteraction.value = new Snap({ source: activeVecSource.value });
    mapInstance.value.addInteraction(snapInteraction.value);

    hasDrawInteraction(mapInstance.value);
    isDrawing.value = true;

    // 解绑旧事件，避免重复
    if (drawEndKey) unByKey(drawEndKey);

    drawInteraction.value.on("drawstart", () => {
      console.log("开始绘制:");
    });
    // 等于每一次新的绘制,都开了一个监听事件
    drawEndKey = drawInteraction.value.on("drawend", (evt) => {
      console.log("绘制完成:", evt.feature.getGeometry().getCoordinates());
      cancelDraw();
    });

    console.log("startDraw执行了");
    console.log("qwert", drawInteraction.value, snapInteraction.value);
  }

  //   取消绘制 ,取消绘制时,同时清除他的监听事件
  function cancelDraw() {
    if (drawInteraction.value) {
      mapInstance.value.removeInteraction(drawInteraction.value);
      drawInteraction.value = null;
      isDrawing.value = false;
    }
    if (drawEndKey) {
      unByKey(drawEndKey);
      drawEndKey = null;
    }
  }

  function removeAllInteractions() {
    const interactions = [drawInteraction, modifyInteraction, snapInteraction, selectInteraction];
    interactions.forEach((refObj) => {
      if (refObj.value && mapInstance.value) {
        mapInstance.value.removeInteraction(refObj.value);
        refObj.value = null;
      }
    });
    isDrawing.value = false;

    if (drawEndKey) {
      unByKey(drawEndKey);
      drawEndKey = null;
    }
  }

  /* 
    清除当前图层上所有已绘制得矢量,不能删除交互
    绘制交互要不要清除,不清楚可以,清除也可以
  */
  function clearAllFeatures() {
    // cancelDraw()
    activeVecSource.value.clear();
  }

  /** 获取选中要素 */
  function getSelectedFeatures() {
    if (!selectInteraction.value) return [];
    return selectInteraction.value.getFeatures() || [];
  }

  function deleteSelectedFeatures() {
    if (!selectInteraction.value || !activeVecSource.value) {
      return { success: false, message: "交互或数据源未初始化" };
    }

    const selectedFeatures = selectInteraction.value.getFeatures();
    if (selectedFeatures.getLength() > 0) {
      selectedFeatures.forEach((f) => {
        activeVecSource.value.removeFeature(f);
      });
      selectedFeatures.clear();
      return { success: true, message: "删除成功" };
    } else {
      return { success: false, message: "请选择要删除的要素" };
    }
  }

  return {
    isDrawing,
    drawInteraction,
    modifyInteraction,
    snapInteraction,
    selectInteraction,
    addInteraction,
    startDraw,
    cancelDraw,
    removeAllInteractions,
    clearAllFeatures,
    getSelectedFeatures,
    deleteSelectedFeatures,
  };
}

function hasDrawInteraction(map) {
  if (!map) return false;
  return map
    .getInteractions()
    .getArray()
    .some((i) => {
      console.log("i", i instanceof Draw);
    });
}
