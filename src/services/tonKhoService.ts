import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { TonKhoTongQuan, GetTonKhoParams } from "../types/ton-kho";

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
};
