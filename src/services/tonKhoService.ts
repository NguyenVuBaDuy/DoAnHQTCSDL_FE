import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type {
  TonKhoTongQuan,
  TonKhoCuaHang,
  GetTonKhoParams,
  ChiTietBienTheResponse,
} from "../types/ton-kho";

export const tonKhoService = {
  getTonKhoTongQuan: async (
    params: GetTonKhoParams,
  ): Promise<ApiResponse<PageResponse<TonKhoTongQuan>>> => {
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<TonKhoTongQuan>>
    >("/ton-kho/tong-quan", {
      params,
    });
    return data;
  },

  getTonKhoCuaHang: async (
    maCh: number,
    params: GetTonKhoParams,
  ): Promise<ApiResponse<PageResponse<TonKhoCuaHang>>> => {
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<TonKhoCuaHang>>
    >(`/ton-kho/cua-hang/${maCh}`, {
      params,
    });
    return data;
  },

  getChiTietBienThe: async (
    maBienThe: number,
  ): Promise<ApiResponse<ChiTietBienTheResponse>> => {
    const { data } = await apiClient.get<ApiResponse<ChiTietBienTheResponse>>(
      `/ton-kho/bien-the/${maBienThe}`,
    );
    return data;
  },
};

