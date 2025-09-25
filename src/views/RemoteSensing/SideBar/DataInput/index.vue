<script setup>
import { getVectorListApi, getVectorDetailApi } from "@/api/vector.js";
import { getImgMapListApi } from "@/api/image.js";
import { arrDataToFeatures } from "@/gis/geojsonUtils";
import { useMapStore } from "@/stores/modules/mapStore";
import { flyTo, flyToVec } from "@/gis/mapService.js";
import { addNewImgLayer } from "@/gis/layerFactory.js";
import { getVectorLayerStyle } from "@/gis/styleUtils.js";

const mapStore = useMapStore();
const dataList = ref([]); // 存储影像和矢量数据的列表

// 获取影像数据列表
async function getImgMapList() {
  try {
    const res = await getImgMapListApi({ pageSize: 200 }, { isShare: true });
    const data = res.data.filter((item) => item.isShare);
    data.forEach((el) => {
      el.dataType = "img";
      el.isShow = false;
    });
    // console.log("影像数据列表：", data);
    return data;
  } catch (err) {
    console.error("获取影像失败", err);
    return []; // 兜底
  }
}

// 获取矢量数据列表
async function getVectorList() {
  try {
    const res = await getVectorListApi({ pageSize: 200 }, { isShare: true });
    const data = res.data.filter((item) => item.isShare);
    data.forEach((el) => {
      el.dataType = "vec";
      el.isShow = false;
    });
    // console.log("矢量数据列表：", data);
    return data;
  } catch (err) {
    console.error("获取矢量失败", err);
    return []; // 兜底
  }
}

// 获取数据列表（影像+矢量）
async function getDataList() {
  const [imgList, vecList] = await Promise.all([getImgMapList(), getVectorList()]);
  dataList.value = [...imgList, ...vecList];
  console.log("数据列表：", dataList.value);
}
getDataList();

// 获取矢量数据详情
async function getVecDetail(id) {
  try {
    const res = await getVectorDetailApi({ vectorId: id });
    const data = res.data.map((item) => {
      return {
        ...item,
        gemo: JSON.parse(JSON.parse(item.gjson).the_geom),
      };
    });
    console.log("vec detail", data);
    return data;
  } catch (err) {
    console.error("获取矢量详情失败", err);
    return []; // 兜底
  }
}

// 影像图层的显示与隐藏
function toggleImgLayer(curLayer) {
  // 当前图层显示,就隐藏
  if (curLayer.isShow) {
    // 清除之前的图层
    mapStore.clearActiveImgLayer();
    curLayer.isShow = false;
  }
  // 当前图层隐藏,就显示
  else {
    // 清除之前的图层
    mapStore.clearActiveImgLayer();
    // 其它影像图层的isShow = false
    dataList.value.forEach((item) => {
      if (item.dataType === "img") {
        item.isShow = false;
      }
    });
    curLayer.isShow = true;

    // 创建并显示新的图层
    addNewImgLayer(curLayer.wmsUrl);

    const coord = [+curLayer.coordinate.split(",")[0], +curLayer.coordinate.split(",")[1]];
    flyTo({
      center: coord,
    });
  }
}

// 矢量图层的显示与隐藏
async function toggleVectorLayer(curLayer) {
  if (curLayer.isShow) {
    // 隐藏,就清除图层
    mapStore.resetActiveVectorLayer();
    curLayer.isShow = false;
  } else {
    // 显示,就创建图层
    const id = curLayer.id;
    const data = await getVecDetail(id);
    const features = arrDataToFeatures(data);
    mapStore.addFeatures(features);
    const newStyle = getVectorLayerStyle();
    mapStore.activeVecLayer.setStyle(newStyle);
    flyToVec();

    curLayer.isShow = true;
  }
}

// 图层切换
const handleToggleLayer = (item) => {
  if (item.dataType === "img") {
    toggleImgLayer(item);
  } else if (item.dataType === "vec") {
    toggleVectorLayer(item);
  }
};
</script>

<template>
  <div class="data-input">
    <div class="flex-y-center justify-between p-2">
      <div>数据输入图层</div>
      <el-button type="info">导入数据</el-button>
    </div>

    <div class="list">
      <div class="item flex-y-center justify-between py-1 mb-1">
        <div class="flex-y-center">
          <el-icon class="mr-2"><View /></el-icon>
          <div>天地图底图</div>
        </div>
        <div></div>
      </div>
      <div
        v-for="item in dataList"
        :key="item.id"
        class="item flex-y-center justify-between py-2 mb-2"
      >
        <div class="flex-y-center">
          <div class="flex-y-center" @click="handleToggleLayer(item)">
            <el-icon v-if="item.isShow === true" class="mr-2 cursor-pointer"><View /></el-icon>
            <el-icon v-else class="mr-2 cursor-pointer"><Hide /></el-icon>
          </div>
          <div>{{ item.name }}</div>
        </div>
        <div class="cursor-pointer">...</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
