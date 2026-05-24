export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  soTaiKhoanHoatDong?: number;
  soTaiKhoanBiKhoa?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}
