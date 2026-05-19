import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { KhachHang, GetKhachHangParams } from "../types/khach-hang";

export const khachHangService = {
  getKhachHangs: async (
    params: GetKhachHangParams,
  ): Promise<ApiResponse<PageResponse<KhachHang>>> => {
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<KhachHang>>
    >("/khachhang", {
      params,
    });
    return data;
  },

  createKhachHang: async (
    payload: import("../types/khach-hang").CreateKhachHangRequest,
  ): Promise<ApiResponse<KhachHang>> => {
    const { data } = await apiClient.post<ApiResponse<KhachHang>>(
      "/khachhang",
      payload,
    );
    return data;
  },

  updateKhachHang: async (
    id: number,
    payload: import("../types/khach-hang").CreateKhachHangRequest,
  ): Promise<ApiResponse<KhachHang>> => {
    const { data } = await apiClient.put<ApiResponse<KhachHang>>(
      `/khachhang/${id}`,
      payload,
    );
    return data;
  },
};
