import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { HoaDonRequest, HoaDonResponse, ChiTietHoaDonResponse } from "../types/hoa-don";

export const hoaDonService = {
  getAll: async (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<HoaDonResponse>>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<HoaDonResponse>>>("/api/hoa-don", {
      params: {
        page: params?.page !== undefined ? params.page : 1,
        size: params?.size || 10,
      },
    });
    return data;
  },

  getById: async (maHd: number): Promise<ApiResponse<HoaDonResponse>> => {
    const { data } = await apiClient.get<ApiResponse<HoaDonResponse>>(`/api/hoa-don/${maHd}`);
    return data;
  },

  getChiTiet: async (maHd: number): Promise<ApiResponse<ChiTietHoaDonResponse[]>> => {
    const { data } = await apiClient.get<ApiResponse<ChiTietHoaDonResponse[]>>(`/api/hoa-don/${maHd}/chi-tiet`);
    return data;
  },

  createHoaDon: async (payload: HoaDonRequest): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>("/api/hoa-don", payload);
    return data;
  },

  updateStatus: async (maHd: number, trangThai: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/api/hoa-don/${maHd}/trang-thai`, null, {
      params: {
        trangThai,
      },
    });
    return data;
  },

  cancelHoaDon: async (maHd: number): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/api/hoa-don/${maHd}/cancel`);
    return data;
  },
};
