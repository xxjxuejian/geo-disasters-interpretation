import request from "@/utils/request";

// 影像列表
export function getImgMapListApi(params, data) {
  return request({
    url: "/image/list",
    method: "post",
    params,
    data,
  });
}

// 影像详情
export const getImgInfoApi = (id) => {
  return request({
    url: `/image/info/${id}`,
    method: "get",
  });
};
