<script setup>
import { getImgMapListApi } from "@/api/image.js";
import { useMapStore } from "@/stores/modules/mapStore";
import { flyTo } from "@/gis/mapService.js";
import { addNewImgLayer } from "@/gis/layerFactory.js";
import { Draw, Modify, Snap, Select } from "ol/interaction.js";
import { click } from "ol/events/condition.js";
import { Style, Stroke } from "ol/style.js";
import { onMounted } from "vue";
import GeoJSON from "ol/format/GeoJSON.js";
import { ElMessage } from "element-plus";

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
const isDrawing = ref(false); // 是否正在绘制

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
  isDrawing.value = true;
  draw();
};

// 2. 定义 draw 变量（后续添加/移除用）
let drawInteraction = null;
let modifyInteraction = null;
let snapInteraction = null;
let selectInteraction = null; // 删除交互

function addInteraction() {
  // ========== 选择交互（高亮） ==========
  selectInteraction = new Select({
    condition: click,
    style: new Style({
      stroke: new Stroke({
        color: "blue",
        width: 3,
      }),
    }),
  });
  mapStore.mapInstance.addInteraction(selectInteraction);

  // ========== 监听选择事件 ==========
  selectInteraction.on("select", (evt) => {
    if (evt.selected.length > 0) {
      console.log("选中了多边形:", evt.selected[0]);
    }

    console.log("选中的矢量", selectInteraction.getFeatures());
    console.log("编辑实例", modifyInteraction);
  });

  // ========== 修改交互（基于选择） ==========
  modifyInteraction = new Modify({
    features: selectInteraction.getFeatures(), // 只允许修改选中的要素
  });
  mapStore.mapInstance.addInteraction(modifyInteraction);

  modifyInteraction.on("modifyend", (evt) => {
    evt.features.forEach((f) => {
      console.log("被修改的要素:", f);
      console.log("modifyend 绘制完成的多边形：", evt);
    });
  });
}

// 移除所有交互，避免冲突
function clearInteractions() {
  if (drawInteraction) {
    mapStore.mapInstance.removeInteraction(drawInteraction);
    drawInteraction = null;
    isDrawing.value = false;
  }
  if (modifyInteraction) {
    mapStore.mapInstance.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }
  if (snapInteraction) {
    mapStore.mapInstance.removeInteraction(snapInteraction);
    snapInteraction = null;
  }
}

function draw() {
  const vectorSource = mapStore.getActiveVecSource();
  // 绘制
  drawInteraction = new Draw({
    source: vectorSource,
    type: "Polygon",
  });
  mapStore.mapInstance.addInteraction(drawInteraction);

  // 吸附
  snapInteraction = new Snap({ source: vectorSource });
  mapStore.mapInstance.addInteraction(snapInteraction);

  drawInteraction.on("drawstart", () => {
    console.log("开始绘制");
  });
  drawInteraction.on("drawend", (evt) => {
    const geometry = evt.feature.getGeometry();
    console.log("drawend 绘制完成的多边形：", evt);
    console.log("drawend 绘制完成的多边形坐标：", geometry.getCoordinates());
    if (drawInteraction) {
      mapStore.mapInstance.removeInteraction(drawInteraction);
      drawInteraction = null;
      isDrawing.value = false;
    }
  });
}

const handleCancel = () => {
  if (drawInteraction) {
    mapStore.mapInstance.removeInteraction(drawInteraction);
    drawInteraction = null;
    isDrawing.value = false;
  }
};

// 清除之前所有的绘制
const handleClear = () => {
  clearInteractions();
  const vectorSource = mapStore.getActiveVecSource();
  vectorSource.clear();
};

// 删除图形
const handleDelVec = () => {
  if (drawInteraction) {
    mapStore.mapInstance.removeInteraction(drawInteraction);
    drawInteraction = null;
    isDrawing.value = false;
  }
  const selectedFeatures = selectInteraction.getFeatures();

  if (selectedFeatures.getLength() > 0) {
    selectedFeatures.forEach((f) => {
      mapStore.getActiveVecSource().removeFeature(f);
    });
    selectedFeatures.clear();
    ElMessage.success("删除成功");
  } else {
    ElMessage.warning("请选择要删除的图形");
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

/* 
  开始绘制,进行绘制,绘制完成
  绘制完成一个,直接结束交互,支持选中编辑以及删除,也可以进行新的绘制,之前矢量需要保留
  所有已经绘制的矢量,点击时高亮显示,这时候可以进行编辑或者删除,
  删除的交互通过右键实现? 右键弹出一个弹窗,然后进行删除
*/

const handleGoBack = () => {
  emit("back");
};
onMounted(() => {
  addInteraction();
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
          <el-button @click="handleClear">清除全部</el-button>
          <el-button @click="handleDelVec">删除选中</el-button>
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
