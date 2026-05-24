import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type {
  TongQuanThongKeResponse,
  TopSanPhamResponse,
  DoanhThuTheoThoiGianResponse,
  DoanhThuTheoDanhMucResponse,
  DoanhThuTheoCuaHangResponse,
} from "../types/thong-ke";

export const thongKeService = {
  getTongQuan: async (params?: {
    maCh?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TongQuanThongKeResponse>> => {
    const { data } = await apiClient.get<ApiResponse<TongQuanThongKeResponse>>("/api/thong-ke/tong-quan", {
      params: {
        maCh: params?.maCh,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    });
    return data;
  },

  getTopSanPham: async (params?: {
    maCh?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TopSanPhamResponse[]>> => {
    const { data } = await apiClient.get<ApiResponse<TopSanPhamResponse[]>>("/api/thong-ke/top-san-pham", {
      params: {
        maCh: params?.maCh,
        limit: params?.limit || 5,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    });
    return data;
  },

  getDoanhThu: async (params?: {
    maCh?: number;
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "month";
  }): Promise<ApiResponse<DoanhThuTheoThoiGianResponse[]>> => {
    const { data } = await apiClient.get<ApiResponse<DoanhThuTheoThoiGianResponse[]>>("/api/thong-ke/doanh-thu", {
      params: {
        maCh: params?.maCh,
        startDate: params?.startDate,
        endDate: params?.endDate,
        groupBy: params?.groupBy || "day",
      },
    });
    return data;
  },

  getDoanhThuTheoDanhMuc: async (params?: {
    maCh?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<DoanhThuTheoDanhMucResponse[]>> => {
    const { data } = await apiClient.get<ApiResponse<DoanhThuTheoDanhMucResponse[]>>("/api/thong-ke/danh-muc", {
      params: {
        maCh: params?.maCh,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    });
    return data;
  },

  getDoanhThuTheoCuaHang: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<DoanhThuTheoCuaHangResponse[]>> => {
    const { data } = await apiClient.get<ApiResponse<DoanhThuTheoCuaHangResponse[]>>("/api/thong-ke/cua-hang", {
      params: {
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    });
    return data;
  },
};
