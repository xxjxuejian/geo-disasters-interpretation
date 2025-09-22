<script setup>
import { getIoResultListApi } from "@/api/ioresult";
import { getImgInfoApi } from "@/api/image";
import { getResultInfoApi } from "@/api/result";
import { getVectorInfoApi } from "@/api/vector";

import { addImgLayer, showDrawArea, showResVecArea, addVecToLayer } from "@/composables/mapOptions";
import { ElMessage } from "element-plus";
import { useMapStore } from "@/stores/modules/mapStore";

const mapStore = useMapStore();

const ioResultList = ref([]);
async function getIoResultList() {
  const res = await getIoResultListApi();
  ioResultList.value = res.data.filter((item) => item.isShare);
  ioResultList.value.forEach((item) => {
    item.isExpand = false;
  });
  console.log("数据输出列表", ioResultList.value);
}

getIoResultList();

// 点击某一个输出结果
const handleIOClick = async (item) => {
  ioResultList.value.forEach((ele) => {
    if (item.id !== ele.id) {
      ele.isExpand = false;
    }
  });

  if (item.status === 3) {
    ElMessage.error("数据处理失败，请重新处理！");
    return;
  }

  // 2. 展示绘制的矢量区域
  // const vec = await getVectorInfoApi(res.data.vectorId);
  // console.log("矢量信息", vec);

  mapStore.clearActiveImgLayer();
  mapStore.resetActiveVectorLayer();

  // 如果已经展开，就收起
  if (item.isExpand) {
    item.isExpand = false;
  }
  // 未展开就展开
  else {
    item.isExpand = true;

    // 调用一次这个才能拿到下面的各种id数据
    const res = await getResultInfoApi(item.id);
    console.log("解译结果", res);

    // 展示影像地图
    const img = await getImgInfoApi(item.imageId);
    console.log("影像信息", img);
    addImgLayer(img.data);

    const drawArea = JSON.parse(res.data.drawArea);
    console.log("绘制区域", drawArea);
    showDrawArea(drawArea);

    // const resArea = JSON.parse(res.data.geom);
    const resArea = res.data.geom;
    // console.log("解译结果矢量", resArea);
    addVecToLayer(resArea);
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
              <div class="flex-y-center cursor-pointer">
                <el-icon class="mr-2 cursor-pointer"><View /></el-icon>
                <!-- <el-icon class="mr-2 cursor-pointer"><Hide /></el-icon> -->
              </div>
              <div>{{ item.imageName }}</div>
            </div>
            <div class="cursor-pointer">...</div>
          </div>
          <div class="sub-item">
            <div class="flex-y-center">
              <el-icon class="mr-2 cursor-pointer"><View /></el-icon>
              <!-- <el-icon class="mr-2 cursor-pointer"><Hide /></el-icon> -->
              <div>{{ item.areaName }}</div>
            </div>
            <div class="cursor-pointer">...</div>
          </div>
          <div class="sub-item">
            <div class="flex-y-center">
              <el-icon class="mr-2 cursor-pointer"><View /></el-icon>
              <!-- <el-icon class="mr-2 cursor-pointer"><Hide /></el-icon> -->
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
      height: 60px;
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
