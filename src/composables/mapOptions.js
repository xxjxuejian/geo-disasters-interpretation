import { useMapStoreHook } from "@/stores/modules/mapStore";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import mapUrls from "@/gis/mapUrls";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { Style, Fill, Stroke } from "ol/style.js";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";

const mapStore = useMapStoreHook();

// 初始化地图
export function initMap(mapEl) {
  if (!mapEl || mapStore.mapInstance) return;

  // 影像底图
  const baseImgLayer = new TileLayer({
    source: new XYZ({
      url: mapUrls["tian-img"],
    }),
    title: "影像底图",
    zIndex: 1,
  });

  // 2.1 添加影像底图的注记
  const labelLayer = new TileLayer({
    source: new XYZ({
      url: mapUrls["tian-label"],
    }),
    title: "道路标记",
    zIndex: 2, // TODO: 道路标记层级要比tif影像图层级要高
  });

  // 创建矢量图层,供后续使用
  const vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    zIndex: 10,
  });
  mapStore.setActiveVecLayer(vectorLayer);

  const map = new Map({
    target: mapEl,
    layers: [baseImgLayer, labelLayer, vectorLayer],
    view: new View({
      projection: "EPSG:4326",
      center: [0, 0],
      zoom: 12,
    }),
  });

  map.getView().animate({
    // 只设置需要的属性即可
    //   120.25, 30.4
    center: [105.2355, 26.7146], // 中心点
    zoom: 15, // 缩放级别
    rotation: undefined, // 缩放完成view视图旋转弧度
    duration: 1000, // 缩放持续时间，默认不需要设置
  });

  mapStore.setMapInstance(map);
}

// 创建图层
export function createWMSLayer(wmsUrl = "LYN:LPQ3857") {
  let layer = new TileLayer({
    source: new TileWMS({
      url: "http://192.168.1.253:8080/geoserver/wms/",
      params: {
        VERSION: "1.1.0",
        REQUEST: "GetMap",
        layers: wmsUrl, // LYN:linping_16db,(地名标记)  LYN:LPQ3857,LYN:lp_water,LYN:osm_lp,LYN:lp_vegetatin
      },
      crossOrigin: "anonymous",
      serverType: "geoserver",
    }),
    zIndex: 5,
  });

  return layer;
}

// 设置视角
export function setMapView(config = {}) {
  if (!mapStore.mapInstance) return;
  const view = mapStore.mapInstance.getView();
  view.animate({
    ...config,
    zoom: 15,
    duration: 1500,
  });
}

export function addImgLayer(target) {
  mapStore.clearActiveImgLayer();

  // 创建并显示新的图层
  const coord = [+target.coordinate.split(",")[0], +target.coordinate.split(",")[1]];
  const imgLayer = createWMSLayer(target.wmsUrl);
  mapStore.mapInstance.addLayer(imgLayer);
  mapStore.setActiveImgLayer(imgLayer);
  setMapView({
    center: coord,
  });
}

// 设置矢量图层的样式,这里是直接生成一个style对象
export function getVecLayerStyle() {
  // 需要一个style的store
  const newStyle = new Style({
    fill: new Fill({
      color: "rgba(49, 48, 48, 0.2)", // 填充颜色，支持透明度
    }),
    stroke: new Stroke({
      color: "#f50f0fff", // 描边颜色
      width: 2, // 描边宽度
      lineDash: [10, 5], // 描边虚线：10像素实线 + 5像素空白
    }),
  });
  return newStyle;
}

// 填充图层的数据
export function fillVecLayer(data) {
  mapStore.resetActiveVectorLayer();

  const geojsonFormat = new GeoJSON();

  const features = data.map((item) => {
    return geojsonFormat.readFeature(
      {
        type: "Feature",
        geometry: item.gemo,
      },
      {
        dataProjection: "EPSG:4326", // 数据坐标系是WGS84
        featureProjection: "EPSG:4326", // 地图使用Web墨卡托
      }
    );
  });
  console.log("features", features);

  // 2. 创建一个矢量数据源，并添加要素
  const vectorSource = new VectorSource({
    features: features,
  });

  mapStore.activeVecLayer.setSource(vectorSource);
  mapStore.activeVecLayer.setStyle(getVecLayerStyle());

  const extent = vectorSource.getExtent();
  mapStore.mapInstance.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 14 });
}

// 显示绘制区域矢量
export function showDrawArea(coordinate) {
  if (!mapStore.activeVecLayer) {
    const layer = new VectorLayer();
    layer.setZIndex(10); // 注意图层的index
    mapStore.setActiveVecLayer(layer);
  }

  const polygon = new Polygon([coordinate]);

  // 创建 Feature
  const feature = new Feature({
    geometry: polygon,
  });

  const vectorSource = new VectorSource({
    features: [feature],
  });

  mapStore.activeVecLayer.setSource(vectorSource);
  return feature;
}

// 显示解译结果矢量
export function showResVecArea(geojsonData) {
  if (!mapStore.activeVecLayer) {
    const layer = new VectorLayer();
    layer.setZIndex(10);
    mapStore.setActiveVecLayer(layer);
  }

  // === Step 2: 使用 GeoJSON 格式化器解析 features ===
  const features = new GeoJSON().readFeatures(geojsonData, {
    dataProjection: "EPSG:4326", // 后端数据一般是 WGS84 经纬度
    featureProjection: "EPSG:4326", // OpenLayers 默认地图投影
  });

  const vectorSource = new VectorSource({
    features: features,
  });
  mapStore.activeVecLayer.setSource(vectorSource);
  return features;
}

// 在已经存在的矢量图层上继续添加矢量，保留之前的矢量
// geojsonData是GeoJSON格式的FeatureCollection
export function addVecToLayer(geojsonData) {
  if (!mapStore.activeVecLayer) {
    const layer = new VectorLayer();
    layer.setZIndex(10);
    mapStore.setActiveVecLayer(layer);
  }

  const features = handleGeoJSON(geojsonData);
  // 假设你已经有了 vectorLayer
  const source = mapStore.activeVecLayer.getSource();
  // 在数据源上添加新的feature
  source.addFeatures(features);
  return features;
}

/* 
 后端返回的GeoJSON数据,顶层可能是Geometry / Feature / FeatureCollection /，这里统一处理
 data: JSON.parse以后js对象
 返回值：Feature[]（OpenLayers 的 Feature 数组）
*/
export function handleGeoJSON(data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  let features = [];
  const geojsonFormat = new GeoJSON();

  switch (data.type) {
    // 1️⃣ Geometry
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon": {
      const geom = geojsonFormat.readGeometry(data, {
        dataProjection: "EPSG:4326", // 后端数据一般是 WGS84 经纬度
        featureProjection: "EPSG:4326", // OpenLayers 默认地图投影
      });
      features.push(new Feature({ geometry: geom }));
      break;
    }

    // 2️⃣ Feature
    case "Feature": {
      features = geojsonFormat.readFeatures(data, {
        dataProjection: "EPSG:4326", // 后端数据一般是 WGS84 经纬度
        featureProjection: "EPSG:4326", // OpenLayers 默认地图投影
      });
      break;
    }

    // 3️⃣ FeatureCollection
    case "FeatureCollection": {
      features = geojsonFormat.readFeatures(data, {
        dataProjection: "EPSG:4326", // 后端数据一般是 WGS84 经纬度
        featureProjection: "EPSG:4326", // OpenLayers 默认地图投影
      });
      break;
    }

    // 4️⃣ GeometryCollection
    case "GeometryCollection": {
      // GeometryCollection 是几何的集合，需要逐个转成 Feature
      data.geometries.forEach((geomData) => {
        const geom = geojsonFormat.readGeometry(geomData, {
          dataProjection: "EPSG:4326", // 后端数据一般是 WGS84 经纬度
          featureProjection: "EPSG:4326", // OpenLayers 默认地图投影
        });
        features.push(new Feature({ geometry: geom }));
      });
      break;
    }

    default: {
      console.warn("不支持的 GeoJSON 类型：", data.type);
    }
  }

  console.log("feature Collections", features);
  return features;
}
