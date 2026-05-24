import { FiX } from "react-icons/fi";
import type { NhaCungCap } from "../../../types/nha-cung-cap";

interface NhaCungCapDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nhaCungCap: NhaCungCap | null;
}

const NhaCungCapDetailDrawer = ({
  isOpen,
  onClose,
  nhaCungCap,
}: NhaCungCapDetailDrawerProps) => {
  if (!isOpen || !nhaCungCap) return null;

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
              Thông tin nhà cung cấp
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
            {/* THÔNG TIN NHÀ CUNG CẤP */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                Chi tiết đối tác
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Mã NCC</span>
                    <span className="text-sm font-semibold text-gray-900">{nhaCungCap.maNcc}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Tên nhà cung cấp</span>
                    <span className="text-sm font-semibold text-gray-900">{nhaCungCap.tenNcc}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Số điện thoại</span>
                    <span className="text-sm font-semibold text-gray-900">{nhaCungCap.sdt || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <span className="text-sm font-semibold text-gray-900">{nhaCungCap.email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Mã số thuế</span>
                    <span className="text-sm font-semibold text-gray-900">{nhaCungCap.maSoThue || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Địa chỉ</span>
                    <span className="text-sm font-semibold text-gray-900 leading-relaxed">
                      {nhaCungCap.diaChi || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nhaCungCap.trangThai === "HoatDong"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {nhaCungCap.trangThai === "HoatDong" ? "Hoạt động" : "Dừng hợp tác"}
                    </span>
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

export default NhaCungCapDetailDrawer;
