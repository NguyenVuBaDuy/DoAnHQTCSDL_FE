export interface SanPham {
  maSp: number;
  tenSp: string;
  thuongHieu: string;
  moTa: string;
  anh: string;
  trangThai: string;
  category: {
    maDm: number;
    tenDm: string;
    maDmCha: number | null;
    tenDmCha: string | null;
  };
  variantSummary: {
    totalVariants: number;
    activeVariants: number;
    minGiaBan: number;
    maxGiaBan: number;
    minGiaNhap: number;
    maxGiaNhap: number;
  };
  variants: any | null; // We can type this more strictly later if needed
}

export interface GetSanPhamParams {
  maDm?: number;
  trangThai?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string[];
}
