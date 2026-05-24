export interface NhaCungCap {
  maNcc: number;
  tenNcc: string;
  diaChi?: string;
  sdt?: string;
  email?: string;
  maSoThue?: string;
  trangThai?: string;
}

export type CreateNhaCungCapRequest = Omit<NhaCungCap, "maNcc">;
