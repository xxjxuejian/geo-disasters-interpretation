import axios from "axios";

const httpRequest = axios.create({
  baseURL: "/dev-api",
  timeout: 5000,
});

const token =
  "eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImMxOGI5YTk1LTI4MTgtNDE1YS04YmZlLTFiMjQzY2I5OTlkNiJ9.ECrD5sh5NSvC9nBMrVm-PXTGvPBzHRxiB-hMmqkPABy1JuvT7yZABsq3J2L6qTt1tbbuf1hLdFMgfwodrmRCnQ";

httpRequest.interceptors.request.use(
  (config) => {
    // 如果 Authorization 设置为 no-auth，则不携带 Token
    config.headers["Authorization"] = "Bearer " + token;

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// respone拦截器
httpRequest.interceptors.response.use(
  (response) => {
    const { code, msg } = response.data;

    if (!code) {
      return response.data;
    }
    if (code === 200) {
      return response.data;
    } else {
      // 业务错误
      console.log(code);
      if (code === 401) {
        ElMessage.warning("登录已过期！");
      } else {
        ElMessage.error("请求失败");
      }
      return Promise.reject(new Error(msg));
    }
  },
  (error) => {
    // 处理 token 超时问题
    if (error.response && error.response.data && error.response.data.code === 401) {
      // token超时
    }

    return Promise.reject(error);
  }
);
export default httpRequest;
