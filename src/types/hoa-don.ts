export interface ChiTietHoaDonRequest {
  maBienThe: number;
  soLuong: number;
  giamGia: number;
}

export interface HoaDonRequest {
  maCh: number;
  maKh?: number;
  maDcgh?: number;
  maVoucher?: string;
  phuongThucThanhToan: string; // 'TienMat' | 'ChuyenKhoan'
  loaiHd: string; // 'TaiQuay' | 'Online'
  chiTiet: ChiTietHoaDonRequest[];
}

export interface HoaDonResponse {
  maHd: number;
  maCh: number;
  tenCh?: string;
  maNv?: string;
  tenNv?: string;
  maKh?: number;
  tenKh?: string;
  sdtKh?: string;
  maDcgh?: number;
  hoTenNguoiNhan?: string;
  sdtNguoiNhan?: string;
  diaChiGiaoHang?: string;
  maVoucher?: string;
  tenVoucher?: string;
  ngayLap: string;
  tongTien: number;
  giaTriGiam: number;
  phiVanChuyen: number;
  phuongThucThanhToan: string;
  loaiHd: string;
  trangThai: string;
}

export interface ChiTietHoaDonResponse {
  maHd: number;
  maBienThe: number;
  sku: string;
  tenSp: string;
  mauSac?: string;
  dungLuong?: string;
  kichThuoc?: string;
  soLuong: number;
  donGia: number;
  giamGia: number;
  thanhTien: number;
}
