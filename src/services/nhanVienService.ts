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
  createNhanVien: async (
    payload: import("../types/nhan-vien").CreateNhanVienRequest,
  ): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post<ApiResponse<null>>("/nhan-vien", payload);
    return data;
  },
  updateNhanVien: async (
    maNv: string,
    payload: import("../types/nhan-vien").UpdateNhanVienRequest,
  ): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.put<ApiResponse<null>>(`/nhan-vien/${maNv}`, payload);
    return data;
  },
  updateTrangThaiNhanVien: async (
    maNv: string,
    payload: import("../types/nhan-vien").UpdateTrangThaiRequest,
  ): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.put<ApiResponse<null>>(`/nhan-vien/${maNv}/tai-khoan/trang-thai`, payload);
    return data;
  },
};
