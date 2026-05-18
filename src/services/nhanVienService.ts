import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { GetNhanVienParams, NhanVienListItem } from "../types/nhan-vien";

export const nhanVienService = {
  getNhanViens: async (
    params: GetNhanVienParams,
  ): Promise<ApiResponse<PageResponse<NhanVienListItem>>> => {
    // The API might expect pageable parameters differently (e.g., page, size, sort)
    // We pass them as normal query parameters to axios and it will stringify them.
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<NhanVienListItem>>
    >("/nhan-vien", {
      params,
    });
    return data;
  },
};
