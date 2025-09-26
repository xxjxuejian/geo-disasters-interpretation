<script setup>
import { getImgMapListApi } from "@/api/image.js";
import { useMapStore } from "@/stores/modules/mapStore";
import { flyTo } from "@/gis/mapService.js";
import { addNewImgLayer } from "@/gis/layerFactory.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { useDraw } from "@/composables/useDraw";

const emit = defineEmits(["back"]);
const imgList = ref([]);
const mapStore = useMapStore();
// 提交的表单数据
const formData = ref({
  modeId: 1,
  imgObj: undefined,
  imgId: "",
  drawArea: [],
});

const { mapInstance, activeVecSource } = storeToRefs(mapStore);
const {
  isDrawing,
  addInteraction,
  startDraw,
  cancelDraw,
  removeAllInteractions,
  clearAllFeatures,
  deleteSelectedFeatures,
} = useDraw(mapInstance, activeVecSource);

// 获取影像数据列表
async function getImgMapList() {
  try {
    const res = await getImgMapListApi({ pageSize: 200 }, { isShare: true });
    const data = res.data.filter((item) => item.isShare);
    console.log("影像数据列表：", data);
    imgList.value = data;
  } catch (err) {
    console.error("获取影像失败", err);
  }
}

getImgMapList();

function showImgLayer(curLayer) {
  mapStore.clearActiveImgLayer();
  // 创建并显示新的图层
  addNewImgLayer(curLayer.wmsUrl);
  const coord = [+curLayer.coordinate.split(",")[0], +curLayer.coordinate.split(",")[1]];
  flyTo({
    center: coord,
  });
}

const handleImgChange = (imgObj) => {
  console.log("img change ", imgObj);
  if (imgObj.id) {
    formData.value.imgId = imgObj.id;
  }
  showImgLayer(imgObj);
};

// 开始绘制
const handleStartDraw = () => {
  // 绘制之前确保已经选择了影像图
  if (!formData.value.imgId) {
    ElMessage.error("请选择影像数据");
    return;
  }
  startDraw();
};

const handleCancel = () => {
  cancelDraw();
};

// 清除之前所有的绘制
const handleClearFeatures = () => {
  clearAllFeatures();
};

// 删除图形
const handleDelFeature = () => {
  cancelDraw();
  const result = deleteSelectedFeatures();
  if (result.success) {
    ElMessage.success(result.message);
  } else {
    ElMessage.warning(result.message);
  }
};

const handleSubmit = () => {
  // 提交时,从当前的矢量图层中获取所有的已经绘制的矢量
  // 转为GeoJSON格式，然后发送给后端
  // 用一个feature
  const features = mapStore.getActiveVecSource().getFeatures();
  console.log("图层上的所有要素:", features);

  const format = new GeoJSON();
  const geojson = format.writeFeatures(features);
  console.log("所有要素的 GeoJSON:", geojson);
};

const handleGoBack = () => {
  emit("back");
};
onMounted(() => {
  addInteraction();
});

onUnmounted(() => {
  // 销毁交互
  removeAllInteractions();
});
</script>

<template>
  <div class="land-slide-identify">
    <!-- 顶部返回导航 -->
    <div class="flex-y-center">
      <el-icon class="cursor-pointer" @click="handleGoBack"><Back /></el-icon>
      <span class="ml-4">滑坡识别</span>
    </div>

    <!-- 内容区 -->
    <div class="content">
      <!-- 识别模型 -->
      <div class="item">
        <div>请选择解译识别模型</div>
        <div>识别滑坡</div>
      </div>

      <!--影像数据 -->
      <div class="item">
        <div>请选择要识别的影像数据</div>
        <el-select
          v-model="formData.imgObj"
          placeholder="选择分析数据"
          style="width: 240px"
          @change="handleImgChange"
        >
          <el-option v-for="item in imgList" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </div>

      <!-- 绘制矢量 绘制的前提是已经选择了影像数据 -->
      <div class="item">
        <div>请绘制矢量区域</div>
        <div class="text-sm text-[#999]">
          提示: 点击开始绘制进行矢量绘制,点击鼠标左键绘制第一个坐标,点击右键完成绘制
        </div>
        <div class="flex flex-wrap gap-x-4">
          <el-button v-if="!isDrawing" @click="handleStartDraw">开始绘制</el-button>
          <el-button v-else type="primary">绘制中</el-button>
          <el-button @click="handleCancel">取消</el-button>
          <el-button @click="handleClearFeatures">清除全部</el-button>
          <el-button @click="handleDelFeature">删除选中</el-button>
        </div>
      </div>

      <!-- 提交 -->
      <div>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.land-slide-identify {
  .content {
    .item {
      margin-bottom: 20px;
    }
  }
}

.el-button {
  margin-left: 0;
}
</style>
