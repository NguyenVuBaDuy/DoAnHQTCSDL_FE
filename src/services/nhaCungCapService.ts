import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { NhaCungCap } from "../types/nha-cung-cap";

export const nhaCungCapService = {
  getNhaCungCaps: async (): Promise<ApiResponse<NhaCungCap[]>> => {
    const { data } =
      await apiClient.get<ApiResponse<NhaCungCap[]>>("/nhacungcap");
    return data;
  },
};
