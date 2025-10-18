import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AXIOS_INSTANCE_TIME_OUT } from "@/constants/shared/_axios";
import { auth } from "./firebase";

const getBaseURL = () => {
  if (process.env.NODE_ENV === "development") {
    return "/api-proxy";
  } else {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
};

/**
 * @description axios api instance
 * Next.js rewrites를 통해 /api-proxy -> 백엔드 HTTP로 프록시
 */
const instance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // 쿠키 포함
  headers: {
    "Content-Type": "application/json",
    _retry: "0",
  },
  timeout: AXIOS_INSTANCE_TIME_OUT,
});

// api 요청 시 accessToken 있는지 확인해서, authorization header에 첨부
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      // getIdToken()이 자동으로 만료 체크 + 갱신
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const get = <T>(...args: Parameters<typeof instance.get>) => {
  return instance.get<T, AxiosResponse<T>>(...args);
};

export const post = <T>(...args: Parameters<typeof instance.post>) => {
  return instance.post<T, AxiosResponse<T>>(...args);
};

export const put = <T>(...args: Parameters<typeof instance.put>) => {
  return instance.put<T, AxiosResponse<T>>(...args);
};

export const patch = <T>(...args: Parameters<typeof instance.patch>) => {
  return instance.patch<T, AxiosResponse<T>>(...args);
};

export const del = <T>(...args: Parameters<typeof instance.delete>) => {
  return instance.delete<T, AxiosResponse<T>>(...args);
};
