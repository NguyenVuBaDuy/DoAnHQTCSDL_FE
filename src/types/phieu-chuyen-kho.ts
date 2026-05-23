export interface ChiTietChuyenKhoRequest {
  maBienThe: number;
  soLuong: number;
}

export interface PhieuChuyenKhoRequest {
  maChNguon: number;
  maChDich: number;
  ghiChu: string;
  chiTiet: ChiTietChuyenKhoRequest[];
}

export interface PhieuChuyenKhoResponse {
  maPck: number;
  maChNguon: number;
  tenChNguon: string;
  maChDich: number;
  tenChDich: string;
  maNv: string;
  tenNv: string;
  ngayChuyenKho: string;
  ghiChu: string;
  trangThai: string;
}

export interface ChiTietChuyenKhoResponse {
  maPck: number;
  maBienThe: number;
  sku: string;
  tenSp: string;
  mauSac: string | null;
  dungLuong: string | null;
  kichThuoc: string | null;
  soLuong: number;
}
