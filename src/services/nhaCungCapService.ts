import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { NhaCungCap, CreateNhaCungCapRequest } from "../types/nha-cung-cap";

export const nhaCungCapService = {
  getNhaCungCaps: async (): Promise<ApiResponse<NhaCungCap[]>> => {
    const { data } =
      await apiClient.get<ApiResponse<NhaCungCap[]>>("/nhacungcap");
    return data;
  },

  createNhaCungCap: async (
    payload: CreateNhaCungCapRequest,
  ): Promise<ApiResponse<NhaCungCap>> => {
    const { data } = await apiClient.post<ApiResponse<NhaCungCap>>(
      "/nhacungcap",
      payload,
    );
    return data;
  },

  updateNhaCungCap: async (
    id: number,
    payload: CreateNhaCungCapRequest,
  ): Promise<ApiResponse<NhaCungCap>> => {
    const { data } = await apiClient.put<ApiResponse<NhaCungCap>>(
      `/nhacungcap/${id}`,
      payload,
    );
    return data;
  },

  changeStatusNhaCungCap: async (
    id: number,
    statusPayload: { trangThai: string },
  ): Promise<ApiResponse<NhaCungCap>> => {
    const { data } = await apiClient.patch<ApiResponse<NhaCungCap>>(
      `/nhacungcap/${id}/status`,
      statusPayload,
    );
    return data;
  },
};
