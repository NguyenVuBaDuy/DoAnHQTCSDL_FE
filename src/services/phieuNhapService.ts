import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type {
  CreatePhieuNhapRequest,
  GetPhieuNhapParams,
  PhieuNhapResponse,
} from "../types/phieu-nhap";

export const phieuNhapService = {
  getPhieuNhaps: async (
    params: GetPhieuNhapParams,
  ): Promise<ApiResponse<PageResponse<PhieuNhapResponse>>> => {
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<PhieuNhapResponse>>
    >("/api/phieu-nhap", {
      params,
    });

    return data;
  },

  createPhieuNhap: async (
    payload: CreatePhieuNhapRequest,
  ): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.post<ApiResponse<void>>(
      "/api/phieu-nhap",
      payload,
    );

    return data;
  },
};
