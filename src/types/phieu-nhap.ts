export interface GetPhieuNhapParams {
  page?: number;
  size?: number;
}

export interface ChiTietPhieuNhapRequest {
  maBienThe: number;
  soLuong: number;
  donGia: number;
}

export interface CreatePhieuNhapRequest {
  maCh: number;
  maNcc?: number;
  ghiChu?: string;
  chiTiet: ChiTietPhieuNhapRequest[];
}

export interface PhieuNhapResponse {
  maPn: number;
  maCh: number;
  tenCh?: string;
  maNcc?: number;
  tenNcc?: string;
  maNv?: string;
  tenNv?: string;
  ngayNhap?: string;
  tongTien?: number;
  ghiChu?: string;
  trangThai?: string;
}

export interface ChiTietPhieuNhapResponse {
  maPn: number;
  maBienThe: number;
  sku?: string;
  tenSp?: string;
  mauSac?: string;
  dungLuong?: string;
  kichThuoc?: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}
