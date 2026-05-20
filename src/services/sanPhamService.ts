import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { SanPham, GetSanPhamParams } from "../types/san-pham";

export const sanPhamService = {
  getSanPhams: async (
    params: GetSanPhamParams,
  ): Promise<ApiResponse<PageResponse<SanPham>>> => {
    // Convert array sort params to multiple sort query params if axios doesn't handle it
    // Or just pass params normally, standard qs serialization handles it usually.
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<SanPham>>
    >("/admin/san-pham", {
      params,
    });
    return data;
  },
};
