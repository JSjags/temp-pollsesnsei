// lib/axiosInstance.ts
import axios from "axios";
import { cn } from "./utils";
import { toast } from "react-toastify";
import environment from "@/services/config/base";
import store from "@/redux/store";

// Assuming you have a function to get the token from storage or some other source
const getToken = () => {
  // Replace with actual logic to retrieve the token
  return store.getState().user.token;
};

const axiosInstance = axios.create({
  baseURL: environment.API_BASE_URL,
});

// Interceptor to add the Bearer token to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    // return response.data.data;
    return response?.data ?? response;
  },
  function (error) {
    if (error.request.status === 401 || error.response.status === 401) {
      localStorage.removeItem("token");
      toast.error(
        error?.response?.data?.errors
          ? (
              error?.response?.data?.errors as { [key: string]: unknown }[]
            ).reduce(
              (prev, curr, i, arr) =>
                i < arr.length - 1
                  ? prev + `${i === 0 ? "" : ", "}${curr.msg}`
                  : `${prev}, ${curr.msg}.`,
              ""
            )
          : error?.response?.data?.msg ??
              error?.response?.data?.message ??
              error?.message ??
              "You are not Authorized. Log in to continue"
      );
      return window.location.assign("/login");
    }

    toast.error(
      error?.response?.data?.errors
        ? (
            error?.response?.data?.errors as { [key: string]: unknown }[]
          ).reduce(
            (prev, curr, i, arr) =>
              i < arr.length - 1
                ? prev + `${i === 0 ? "" : ", "}${curr.msg}`
                : `${prev}, ${curr.msg}.`,
            ""
          )
        : error?.response?.data?.msg ??
            error?.response?.data?.message ??
            error?.message ??
            "You are not Authorized. Log in to continue"
    );

    return Promise.reject(error);
  }
);

export default axiosInstance;