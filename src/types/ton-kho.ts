export interface TonKhoTongQuan {
  maBienThe: number;
  sku: string;
  barcode: string;
  maSp: number;
  tenSp: string;
  anhSp: string | null;
  mauSac: string | null;
  dungLuong: string | null;
  kichThuoc: string | null;
  giaBan: number;
  tongSoLuong: number;
  trangThaiBienThe: string;
}

export interface TonKhoCuaHang {
  maCh: number;
  tenCh: string;
  maBienThe: number;
  sku: string;
  barcode: string;
  maSp: number;
  tenSp: string;
  anhSp: string | null;
  mauSac: string | null;
  dungLuong: string | null;
  kichThuoc: string | null;
  giaBan: number;
  soLuong: number;
  trangThaiBienThe: string;
}

export interface GetTonKhoParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string[];
  maSp?: number;
}

export interface ChiTietBienTheResponse {
  maBienThe: number;
  sku: string;
  tenSp: string;
  mauSac: string | null;
  dungLuong: string | null;
  tongSoLuong: number;
  chiTietCuaHang: TonKhoCuaHang[];
}

