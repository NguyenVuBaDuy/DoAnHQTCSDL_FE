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
