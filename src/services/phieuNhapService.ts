import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type {
  CreatePhieuNhapRequest,
  GetPhieuNhapParams,
  PhieuNhapResponse,
  ChiTietPhieuNhapResponse,
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

  getPhieuNhapById: async (
    maPn: number,
  ): Promise<ApiResponse<PhieuNhapResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PhieuNhapResponse>>(
      `/api/phieu-nhap/${maPn}`,
    );

    return data;
  },

  getChiTietPhieuNhap: async (
    maPn: number,
  ): Promise<ApiResponse<ChiTietPhieuNhapResponse[]>> => {
    const { data } = await apiClient.get<ApiResponse<ChiTietPhieuNhapResponse[]>>(
      `/api/phieu-nhap/${maPn}/chi-tiet`,
    );

    return data;
  },

  cancelPhieuNhap: async (
    maPn: number,
  ): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.post<ApiResponse<void>>(
      `/api/phieu-nhap/${maPn}/cancel`,
    );

    return data;
  },
};
