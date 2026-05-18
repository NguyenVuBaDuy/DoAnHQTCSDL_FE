import { FiX } from "react-icons/fi";
import type { NhanVienListItem } from "../../../types/nhan-vien";
import { getRoleName } from "../../../utils/roleUtils";
import { accountStatuses } from "../../../utils/statusUtils";

interface NhanVienDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nhanVien: NhanVienListItem | null;
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

const getStatusLabel = (statusValue: string) => {
  return (
    accountStatuses.find((s) => s.value === statusValue)?.label || statusValue
  );
};

const NhanVienDetailDrawer = ({
  isOpen,
  onClose,
  nhanVien,
}: NhanVienDetailDrawerProps) => {
  if (!isOpen || !nhanVien) return null;

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
              Thông tin nhân viên
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
                    <span className="text-sm font-medium text-gray-500">Mã NV</span>
                    <span className="text-sm font-semibold text-gray-900">{nhanVien.maNv}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Họ và tên</span>
                    <span className="text-sm font-semibold text-gray-900">{nhanVien.hoTen}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">CCCD</span>
                    <span className="text-sm font-semibold text-gray-900">{nhanVien.cccd}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Ngày sinh</span>
                    <span className="text-sm font-semibold text-gray-900">{formatDate(nhanVien.ngaySinh)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Giới tính</span>
                    <span className="text-sm font-semibold text-gray-900">{nhanVien.gioiTinh}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Số điện thoại</span>
                    <span className="text-sm font-semibold text-gray-900">{nhanVien.sdt}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4">
                    <span className="text-sm font-medium text-gray-500">Địa chỉ</span>
                    <span className="text-sm font-semibold text-gray-900 leading-relaxed">{nhanVien.diaChi}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* THÔNG TIN CÔNG VIỆC */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                Thông tin công việc
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Cửa hàng làm việc</span>
                    <span className="text-sm font-semibold text-gray-900">{nhanVien.tenCh}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-medium text-gray-500">Chức vụ</span>
                    <span className="text-sm font-semibold text-gray-900">{getRoleName(nhanVien.chucVu, nhanVien.chucVu)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TÀI KHOẢN HỆ THỐNG */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                Tài khoản hệ thống
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-gray-900">Trạng thái hoạt động</span>
                      <span className="text-[13px] text-gray-500">Trạng thái tài khoản hiện tại</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        nhanVien.trangThai === "HoatDong"
                          ? "bg-green-100 text-green-800"
                          : nhanVien.trangThai === "KhoaTam"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatusLabel(nhanVien.trangThai)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <span className="text-sm font-medium text-gray-500">Nhóm quyền</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-sm font-medium rounded-lg">
                        {getRoleName(nhanVien.tenNhom, nhanVien.tenNhom)}
                      </span>
                    </div>
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

export default NhanVienDetailDrawer;
