import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON.js";

/**
 * 将 GeoJSON 数据转换为 Feature 数组
 * 支持 Geometry / Feature / FeatureCollection / GeometryCollection
 */
export function geojsonToFeatures(data) {
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

/**
 * 将数组数据转换为 Feature
 * @param {Array} data - 包含 gemo 属性的数据数组
 */
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

/**
 * 将坐标数组转成 Feature
 * @param {string} type - Geometry 类型（Polygon / Point / LineString）
 * @param {Array} coordinate - 坐标数组
 */
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
