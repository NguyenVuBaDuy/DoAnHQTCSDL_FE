import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type {
  PhieuChuyenKhoRequest,
  PhieuChuyenKhoResponse,
  ChiTietChuyenKhoResponse,
} from "../types/phieu-chuyen-kho";

export const phieuChuyenKhoService = {
  getAll: async (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<PhieuChuyenKhoResponse>>> => {
    // API page index is 1-based or 0-based? 
    // In api_dox, default is 1. We will use whatever is passed or default to 1.
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<PhieuChuyenKhoResponse>>
    >("/api/phieu-chuyen-kho", {
      params: {
        page: params?.page !== undefined ? params.page : 1,
        size: params?.size || 10,
      },
    });
    return data;
  },

  getById: async (maPck: number): Promise<ApiResponse<PhieuChuyenKhoResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PhieuChuyenKhoResponse>>(
      `/api/phieu-chuyen-kho/${maPck}`
    );
    return data;
  },

  getChiTiet: async (
    maPck: number
  ): Promise<ApiResponse<ChiTietChuyenKhoResponse[]>> => {
    const { data } = await apiClient.get<
      ApiResponse<ChiTietChuyenKhoResponse[]>
    >(`/api/phieu-chuyen-kho/${maPck}/chi-tiet`);
    return data;
  },

  create: async (request: PhieuChuyenKhoRequest): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      "/api/phieu-chuyen-kho",
      request
    );
    return data;
  },

  approve: async (maPck: number): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `/api/phieu-chuyen-kho/${maPck}/approve`
    );
    return data;
  },

  cancel: async (maPck: number): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `/api/phieu-chuyen-kho/${maPck}/cancel`
    );
    return data;
  },
};
