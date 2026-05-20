import { FiX } from "react-icons/fi";
import type { KhachHang } from "../../../types/khach-hang";

interface KhachHangDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  khachHang: KhachHang | null;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "Chưa có thông tin";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("vi-VN").format(date);
  } catch {
    return dateString;
  }
};

const KhachHangDetailDrawer = ({
  isOpen,
  onClose,
  khachHang,
}: KhachHangDetailDrawerProps) => {
  if (!isOpen || !khachHang) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full bg-[#F8F9FA] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Thông tin khách hàng
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* THÔNG TIN CÁ NHÂN */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                Thông tin cá nhân
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Mã KH</span>
                    <span className="text-sm font-semibold text-gray-900">{khachHang.maKh}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Họ và tên</span>
                    <span className="text-sm font-semibold text-gray-900">{khachHang.hoTen}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Ngày sinh</span>
                    <span className="text-sm font-semibold text-gray-900">{formatDate(khachHang.ngaySinh)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Giới tính</span>
                    <span className="text-sm font-semibold text-gray-900">{khachHang.gioiTinh}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Số điện thoại</span>
                    <span className="text-sm font-semibold text-gray-900">{khachHang.sdt}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <span className="text-sm font-semibold text-gray-900">{khachHang.email}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Địa chỉ</span>
                    <span className="text-sm font-semibold text-gray-900 leading-relaxed">{khachHang.diaChi}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-medium text-gray-500">Ngày đăng ký</span>
                    <span className="text-sm font-semibold text-gray-900">{formatDate(khachHang.ngayDangKy)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KhachHangDetailDrawer;
