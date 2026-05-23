import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { SanPham, GetSanPhamParams, SanPhamVariant } from "../types/san-pham";

export interface VariantRequest {
  sku: string;
  barcode: string;
  mauSac?: string | null;
  dungLuong?: string | null;
  kichThuoc?: string | null;
  giaNhap: number;
  giaBan: number;
  trangThai: string;
}

export interface CreateSanPhamRequest {
  maDm: number;
  tenSp: string;
  thuongHieu: string;
  moTa: string;
  anh: string;
  trangThai: string;
  variants: VariantRequest[];
}

export const sanPhamService = {
  getSanPhams: async (
    params: GetSanPhamParams,
  ): Promise<ApiResponse<PageResponse<SanPham>>> => {
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<SanPham>>
    >("/admin/san-pham", {
      params,
    });
    return data;
  },

  getSanPhamDetail: async (
    maSp: number,
  ): Promise<ApiResponse<SanPham>> => {
    const { data } = await apiClient.get<ApiResponse<SanPham>>(
      `/admin/san-pham/${maSp}`,
    );
    return data;
  },

  createSanPham: async (
    payload: CreateSanPhamRequest,
  ): Promise<ApiResponse<SanPham>> => {
    const { data } = await apiClient.post<ApiResponse<SanPham>>(
      "/admin/san-pham",
      payload,
    );
    return data;
  },

  updateSanPham: async (
    maSp: number,
    payload: CreateSanPhamRequest,
  ): Promise<ApiResponse<SanPham>> => {
    const { data } = await apiClient.put<ApiResponse<SanPham>>(
      `/admin/san-pham/${maSp}`,
      payload,
    );
    return data;
  },

  updateTrangThai: async (
    maSp: number,
    trangThai: string,
  ): Promise<ApiResponse<SanPham>> => {
    const { data } = await apiClient.patch<ApiResponse<SanPham>>(
      `/admin/san-pham/${maSp}/trang-thai`,
      null,
      {
        params: { trangThai },
      },
    );
    return data;
  },

  getAllBienThe: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<SanPhamVariant>>> => {
    const { data } = await apiClient.get<
      ApiResponse<PageResponse<SanPhamVariant>>
    >("/api/bien-the", {
      params: {
        search: params?.search,
        page: params?.page !== undefined ? params.page : 1,
        size: params?.size || 10,
      },
    });
    return data;
  },
};

