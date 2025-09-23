import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON.js";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { Style, Fill, Stroke } from "ol/style.js";
/* 
 后端返回的GeoJSON数据,顶层可能是Geometry / Feature / FeatureCollection /，这里统一处理
 data: GeoJSON数据
 返回值：Feature[]（OpenLayers 的 Feature 数组）
*/
export function handleGeoJSONToFeatures(data) {
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

export function arrDataToFeatures(data) {
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
  return features;
}

// 只针对多边形Polygon
export function coordinateToFeature(type = "Polygon", coordinate) {
  const geojsonFormat = new GeoJSON();
  const feature = geojsonFormat.readFeature(
    {
      type: "Feature",
      geometry: {
        type: type,
        coordinates: [coordinate],
      },
    },
    {
      dataProjection: "EPSG:4326", // 数据坐标系是WGS84
      featureProjection: "EPSG:4326", // 地图使用Web墨卡托
    }
  );
  return feature;
}

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
