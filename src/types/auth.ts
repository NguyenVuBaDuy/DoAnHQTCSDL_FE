// ==================== Request ====================

export interface LoginRequest {
  manv: string;
  password: string;
}

// ==================== Response ====================

export interface User {
  matk: number;
  manv: string;
  hoten: string;
  manhom: number;
  tennhom: string;
  chucvu: string;
  mach: number;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginResponse {
  data: LoginData;
  message: string;
  success: true;
  timestamp: string;
}

// ==================== Error ====================

export interface LoginError {
  code: string;
  message: string;
  success: false;
  timestamp: string;
}

// ==================== GetMe ====================

export interface NhanVien {
  hoten: string;
  chucvu: string;
  mach: number;
  sdt: string;
  diachi: string;
  ngaysinh: string;
  gioitinh: string;
}

export interface GetMeData {
  matk: number;
  manv: string;
  manhom: number;
  tennhom: string;
  nhanvien: NhanVien;
}

export interface GetMeResponse {
  data: GetMeData;
  message: string;
  success: boolean;
  timestamp: string;
}
