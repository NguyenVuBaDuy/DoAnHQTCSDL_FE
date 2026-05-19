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
};
