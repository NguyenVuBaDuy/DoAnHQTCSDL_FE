export interface TopSanPhamResponse {
  maSp: number;
  tenSp: string;
  anh?: string;
  soLuongDaBan: number;
  doanhThu: number;
}

export interface TongQuanThongKeResponse {
  tongDoanhThu: number;
  tongDonHang: number;
  tongKhachHang: number;
  tongSanPhamDaBan: number;
  sanPhamSapHetHang: number;
}

export interface DoanhThuTheoThoiGianResponse {
  thoiGian: string;
  doanhThu: number;
  soLuongDonHang: number;
}

export interface DoanhThuTheoDanhMucResponse {
  maDm: number;
  tenDm: string;
  doanhThu: number;
  soLuongDaBan: number;
}

export interface DoanhThuTheoCuaHangResponse {
  maCh: number;
  tenCh: string;
  doanhThu: number;
  soLuongDonHang: number;
}
