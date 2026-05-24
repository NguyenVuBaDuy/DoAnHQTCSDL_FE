import apiClient from "../lib/axios";
import type { ApiResponse, PageResponse } from "../types/api";
import type { VoucherRequest, VoucherResponse } from "../types/voucher";

export type { VoucherResponse };

export const voucherService = {
  getVouchers: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<VoucherResponse>>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<VoucherResponse>>>("/api/voucher", {
      params: {
        search: params?.search || undefined,
        // The API might expect 1-based page index
        page: params?.page !== undefined ? params.page : 1,
        size: params?.size || 10,
      },
    });
    return data;
  },

  getVoucherByCode: async (code: string): Promise<ApiResponse<VoucherResponse>> => {
    const { data } = await apiClient.get<ApiResponse<VoucherResponse>>(`/api/voucher/${code}`);
    return data;
  },

  createVoucher: async (payload: VoucherRequest): Promise<ApiResponse<VoucherResponse>> => {
    const { data } = await apiClient.post<ApiResponse<VoucherResponse>>("/api/voucher", payload);
    return data;
  },

  updateVoucher: async (code: string, payload: VoucherRequest): Promise<ApiResponse<VoucherResponse>> => {
    const { data } = await apiClient.put<ApiResponse<VoucherResponse>>(`/api/voucher/${code}`, payload);
    return data;
  },

  deleteVoucher: async (code: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/api/voucher/${code}`);
    return data;
  },
};
