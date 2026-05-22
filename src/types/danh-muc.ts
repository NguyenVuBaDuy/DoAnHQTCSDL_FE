export interface DanhMuc {
  maDm: number;
  tenDm: string;
  moTa: string;
  maDmCha?: number;
  tenDmCha?: string;
  children?: DanhMuc[];
}
