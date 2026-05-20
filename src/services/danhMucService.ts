import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { DanhMuc } from "../types/danh-muc";

export const danhMucService = {
  getCategoryTree: async (): Promise<ApiResponse<DanhMuc[]>> => {
    const { data } = await apiClient.get<ApiResponse<DanhMuc[]>>("/danhmuc/cay");
    return data;
  },
};
