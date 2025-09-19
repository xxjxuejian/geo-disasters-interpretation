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
