import request from "@/utils/request";

// 获取矢量图形列表
export function getVectorListApi(params, data) {
  return request({
    url: "/vector/list",
    method: "post",
    params,
    data,
  });
}

// 矢量--详情
export const getVectorDetailApi = (params) => {
  return request({
    url: "/vectorext/sublist",
    method: "get",
    params,
  });
};

// 矢量--详情
export const getVectorInfoApi = (id) => {
  return request({
    url: `/vector/info/${id}`,
    method: "get",
  });
};
