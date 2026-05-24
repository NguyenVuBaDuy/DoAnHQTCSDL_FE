export interface VoucherResponse {
  maVoucher: string;
  tenVoucher: string;
  loai: string; // 'PhanTram' | 'TienMat'
  giaTri: number;
  giaTriToiDa?: number;
  dieuKienToiThieu?: number;
  soLuong: number;
  soLuongDaDung: number;
  ngayBatDau: string; // ISO date-time
  ngayHetHan: string; // ISO date-time
  trangThai: string; // 'KichHoat' | 'VoHieu'
  ghiChu?: string;
}

export interface VoucherRequest {
  maVoucher: string;
  tenVoucher: string;
  loai: string; // 'PhanTram' | 'TienMat'
  giaTri: number;
  giaTriToiDa?: number;
  dieuKienToiThieu?: number;
  soLuong: number;
  soLuongDaDung?: number;
  ngayBatDau: string; // ISO date-time
  ngayHetHan: string; // ISO date-time
  trangThai: string; // 'KichHoat' | 'VoHieu'
  ghiChu?: string;
}
