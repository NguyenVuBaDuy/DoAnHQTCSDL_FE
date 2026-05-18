

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
