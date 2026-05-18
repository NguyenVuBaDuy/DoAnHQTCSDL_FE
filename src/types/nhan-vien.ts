

export interface NhanVienListItem {
  maNv: string;
  maCh: number;
  tenCh: string;
  cccd: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  sdt: string;
  diaChi: string;
  chucVu: string;
  maNhom: number;
  tenNhom: string;
  trangThai: string;
}

export interface GetNhanVienParams {
  mach?: number;
  chucvu?: string;
  trangthai?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface CreateNhanVienRequest {
  hoTen: string;
  cccd: string;
  ngaySinh: string; // YYYY-MM-DD
  gioiTinh: string; // "Nam", "Nữ", etc.
  sdt: string;
  diaChi: string;
  chucVu: string;
  maCh: number;
  tenNhom: string;
  password?: string;
  trangThai: string;
}

export type UpdateNhanVienRequest = CreateNhanVienRequest;

export interface UpdateTrangThaiRequest {
  trangThai: string;
}
