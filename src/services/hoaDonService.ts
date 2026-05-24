import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { HoaDonRequest } from "../types/hoa-don";

export const hoaDonService = {
  createHoaDon: async (payload: HoaDonRequest): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>("/api/hoa-don", payload);
    return data;
  },
};
