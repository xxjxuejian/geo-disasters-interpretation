// 数据输出结果
import request from "@/utils/request";

// 解译结果列表
export function getIoResultListApi(params, data) {
  return request({
    url: "/ioresult/list",
    method: "post",
    params,
    data,
  });
}
