<script setup>
import { getIoResultListApi } from "@/api/ioresult";
import { getImgInfoApi } from "@/api/image";
import { getResultInfoApi } from "@/api/result";
import { geojsonToFeatures, coordinateToFeature } from "@/gis/geojsonUtils.js";
import { ElMessage } from "element-plus";
import { useMapStore } from "@/stores/modules/mapStore";
import { flyTo } from "@/gis/mapService.js";
import { addNewImgLayer } from "@/gis/layerFactory.js";

const mapStore = useMapStore();

const ioResultList = ref([]);
async function getIoResultList() {
  const res = await getIoResultListApi();
  ioResultList.value = res.data.filter((item) => item.isShare);
  ioResultList.value.forEach((item) => {
    // 控制是否展开
    item.isExpand = false;
    // 控制是否显示影像图
    item.isShowImg = false;
    // 控制是否显示绘制区域
    item.isShowDrawArea = false;
    // 控制是否显示解译矢量区域
    item.isShowResVec = false;
  });
  console.log("数据输出列表", ioResultList.value);
}

getIoResultList();

// 保存三个图层
let imgLayerInfo;
let drawAreaFeature;
let resVecAreaFeatures;
// 点击某一个输出结果
const handleIOClick = async (item) => {
  let prevIsExpand = item.isExpand;
  ioResultList.value.forEach((ele) => {
    ele.isExpand = false;
    ele.isShowImg = false;
    ele.isShowDrawArea = false;
    ele.isShowResVec = false;
  });
  item.isExpand = prevIsExpand;

  if (item.status === 3) {
    ElMessage.error("数据处理失败，请重新处理！");
    return;
  }

  mapStore.clearActiveImgLayer();
  mapStore.resetActiveVectorLayer();

  // 如果已经展开，就收起
  if (item.isExpand) {
    item.isExpand = false;
    item.isShowImg = false;
    item.isShowDrawArea = false;
    item.isShowResVec = false;
    imgLayerInfo = null;
    drawAreaFeature = null;
    resVecAreaFeatures = null;
    console.log("1111111111111111111111111");
  }
  // 未展开就展开
  else {
    item.isExpand = true;
    item.isShowImg = true;
    item.isShowDrawArea = true;
    item.isShowResVec = true;

    // 调用一次这个才能拿到下面的各种id数据
    const res = await getResultInfoApi(item.id);
    console.log("解译结果", res);

    // 展示影像地图
    mapStore.clearActiveImgLayer();
    const img = await getImgInfoApi(item.imageId);
    console.log("影像信息", img);
    imgLayerInfo = img.data;
    const { coordinate, wmsUrl } = img.data;
    const coords = [+coordinate.split(",")[0], +coordinate.split(",")[1]];
    addNewImgLayer(wmsUrl);
    flyTo({
      center: coords,
    });

    const drawArea = JSON.parse(res.data.drawArea);
    console.log("绘制区域", drawArea);
    const feature = coordinateToFeature("Polygon", drawArea);
    drawAreaFeature = feature;
    mapStore.addFeature(feature);

    const resArea = res.data.geom;
    // console.log("解译结果矢量", resArea);

    const features = geojsonToFeatures(resArea);
    resVecAreaFeatures = features;
    mapStore.addFeatures(features);
  }
};

const handleImgClick = (item) => {
  console.log("toggle img layer", item);
  if (item.isShowImg) {
    mapStore.clearActiveImgLayer();
    item.isShowImg = false;
  } else {
    mapStore.clearActiveImgLayer();
    const { coordinate, wmsUrl } = imgLayerInfo;
    const coords = [+coordinate.split(",")[0], +coordinate.split(",")[1]];
    addNewImgLayer(wmsUrl);

    flyTo({
      center: coords,
    });
    item.isShowImg = true;
  }
};

const handleDrawAreaClick = (item) => {
  const vecSource = mapStore.activeVecLayer.getSource();
  console.log("paint draw area", item);
  if (item.isShowDrawArea) {
    vecSource.removeFeature(drawAreaFeature);
    item.isShowDrawArea = false;
  } else {
    item.isShowDrawArea = true;
    vecSource.addFeature(drawAreaFeature);
  }
};

const handleResVecClick = (item) => {
  const vecSource = mapStore.activeVecLayer.getSource();
  console.log("paint res vecArea", item);
  if (item.isShowResVec) {
    item.isShowResVec = false;
    vecSource.removeFeatures(resVecAreaFeatures);
  } else {
    item.isShowResVec = true;
    vecSource.addFeatures(resVecAreaFeatures);
  }
};
</script>

<template>
  <div class="data-output">
    <div class="flex-y-center justify-between p-2">
      <div>数据输入图层</div>
      <el-button type="info">导入数据</el-button>
    </div>

    <div class="io-list">
      <div v-for="item in ioResultList" :key="item.id">
        <div class="top">
          <div class="left" @click="handleIOClick(item)">
            <el-icon v-if="item.isExpand"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowRight /></el-icon>
          </div>
          <div class="right">
            <div class="mb-1">解译结果名称：{{ item.name }}</div>
            <div class="flex-y-center justify-between gap-2">
              <div>解译类型：{{ item.modelName }}</div>
              <div v-if="item.status === 1">
                进度
                <span class="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                进行中
              </div>
              <div v-if="item.status === 2">
                进度
                <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                成功
              </div>
              <div v-if="item.status === 3">
                进度
                <span class="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                失败
              </div>
            </div>
          </div>
        </div>

        <div v-if="item.isExpand" class="sub-list">
          <div class="sub-item">
            <div class="flex-y-center">
              <div class="flex-y-center cursor-pointer" @click="handleImgClick(item)">
                <el-icon v-if="item.isShowImg" class="mr-2 cursor-pointer"><View /></el-icon>
                <el-icon v-else class="mr-2 cursor-pointer"><Hide /></el-icon>
              </div>
              <div>{{ item.imageName }}</div>
            </div>
            <div class="cursor-pointer">...</div>
          </div>
          <div class="sub-item">
            <div class="flex-y-center" @click="handleDrawAreaClick(item)">
              <el-icon v-if="item.isShowDrawArea" class="mr-2 cursor-pointer"><View /></el-icon>
              <el-icon v-else class="mr-2 cursor-pointer"><Hide /></el-icon>
              <div>{{ item.areaName }}</div>
            </div>
            <div class="cursor-pointer">...</div>
          </div>
          <div class="sub-item">
            <div class="flex-y-center" @click="handleResVecClick(item)">
              <el-icon v-if="item.isShowResVec" class="mr-2 cursor-pointer"><View /></el-icon>
              <el-icon v-else class="mr-2 cursor-pointer"><Hide /></el-icon>
              <div>{{ item.name }}</div>
            </div>
            <div class="cursor-pointer">...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-output {
  .io-list {
    .top {
      display: flex;
      gap: 12px;
      align-items: center;
      height: 90px;
      padding: 16px 0;
      margin-bottom: 8px;
      cursor: pointer;
      border: 1px solid #9d9696;
      border-radius: 8px;

      .left {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 100%;

        border-right: 1px solid #9d9696;
      }
      .right {
        flex: 1;
        padding: 0 2px;
      }
    }
    .sub-list {
      color: #fff;
      background-color: #3e3c3c;

      .sub-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px;
      }
    }
  }
}
</style>
