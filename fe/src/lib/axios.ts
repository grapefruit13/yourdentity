import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AXIOS_INSTANCE_TIME_OUT } from "@/constants/shared/_axios";
import { LINK_URL } from "@/constants/shared/_link-url";
import { auth } from "./firebase";

const getBaseURL = () => {
  return "/api-proxy";
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
    // response.data는 Result<TData> = { status: 200, data: TData } 형태
    // response.data.data가 실제 데이터이므로 이를 반환
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  (error: AxiosError) => {
    // 401 에러 발생 시 로그인 화면으로 리다이렉트
    if (error.response?.status === 401) {
      // 로그아웃된 상태에서 API 요청이 실패한 경우
      // Firebase Auth 상태 확인 후 로그인 화면으로 리다이렉트
      // 단, 로그인 페이지에서는 리다이렉트하지 않아 무한 루프 방지
      const user = auth.currentUser;
      if (!user && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        // 로그인 페이지가 아니고, 이미 리다이렉트 중이 아닌 경우에만 리다이렉트
        if (currentPath !== LINK_URL.LOGIN) {
          window.location.replace(LINK_URL.LOGIN);
        }
      }
    }
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
