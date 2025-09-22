import request from "@/utils/request";
export const getResultListApi = () => {
  return request({
    url: "/result/list",
    method: "get",
  });
};

// 解译结果--详情
export const getResultInfoApi = (id) => {
  return request({
    url: `/result/info/${id}`,
    method: "get",
  });
};
