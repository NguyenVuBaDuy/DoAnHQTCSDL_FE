import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { CuaHang, CreateCuaHangRequest } from "../types/cua-hang";

export const cuaHangService = {
  getCuaHangs: async (): Promise<ApiResponse<CuaHang[]>> => {
    const { data } = await apiClient.get<ApiResponse<CuaHang[]>>("/cuahang");
    return data;
  },
  getCuaHangById: async (id: number): Promise<ApiResponse<CuaHang>> => {
    const { data } = await apiClient.get<ApiResponse<CuaHang>>(`/cuahang/${id}`);
    return data;
  },
  createCuaHang: async (request: CreateCuaHangRequest): Promise<ApiResponse<CuaHang>> => {
    const { data } = await apiClient.post<ApiResponse<CuaHang>>("/cuahang", request);
    return data;
  },
  updateCuaHang: async (id: number, request: CreateCuaHangRequest): Promise<ApiResponse<CuaHang>> => {
    const { data } = await apiClient.put<ApiResponse<CuaHang>>(`/cuahang/${id}`, request);
    return data;
  },
};
