import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";

export interface VoucherResponse {
  maVoucher: string;
  tenVoucher: string;
  loai: string; // 'PhanTram' | 'TienMat'
  giaTri: number;
  giaTriToiDa: number;
  dieuKienToiThieu: number;
  soLuong: number;
  soLuongDaDung: number;
  ngayBatDau: string;
  ngayHetHan: string;
  trangThai: string; // 'KichHoat' | 'VoHieu'
  ghiChu: string;
}

export const voucherService = {
  getVoucherByCode: async (code: string): Promise<ApiResponse<VoucherResponse>> => {
    const { data } = await apiClient.get<ApiResponse<VoucherResponse>>(`/api/voucher/${code}`);
    return data;
  },
};
