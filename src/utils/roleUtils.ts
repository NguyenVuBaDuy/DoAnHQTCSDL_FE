export const getRoleName = (
  roleCode?: string,
  fallback: string = "Hệ thống quản lý",
) => {
  switch (roleCode) {
    case "Admin":
      return "Admin";
    case "QuanLyCuaHang":
      return "Quản lý cửa hàng";
    case "NhanVienBan":
      return "Bộ phận bán hàng";
    case "NhanVienKho":
      return "Bộ phận kho";
    default:
      return roleCode || fallback;
  }
};

export const roles = [
  { value: "Admin", label: "Admin" },
  { value: "QuanLyCuaHang", label: "Quản lý cửa hàng" },
  { value: "NhanVienBan", label: "Bộ phận bán hàng" },
  { value: "NhanVienKho", label: "Bộ phận kho" },
];
