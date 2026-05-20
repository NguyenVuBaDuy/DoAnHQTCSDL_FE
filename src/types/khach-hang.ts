export interface KhachHang {
  maKh: number;
  hoTen: string;
  sdt: string;
  email: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
  ngayDangKy: string;
}

export interface GetKhachHangParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateKhachHangRequest {
  hoTen: string;
  sdt: string;
  email: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
}
