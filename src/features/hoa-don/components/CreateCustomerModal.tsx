import type { FormEvent } from "react";
import { useState } from "react";
import { FiX, FiUser, FiPhone, FiMail, FiCalendar, FiMapPin } from "react-icons/fi";
import { khachHangService } from "../../../services/khachHangService";
import type { CreateKhachHangRequest } from "../../../types/khach-hang";
import { toast } from "react-hot-toast";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
}

const initialForm: CreateKhachHangRequest = {
  hoTen: "",
  sdt: "",
  email: "",
  ngaySinh: "",
  gioiTinh: "Nam",
  diaChi: "",
};

export const CreateCustomerModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateCustomerModalProps) => {
  const [formData, setFormData] = useState<CreateKhachHangRequest>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.hoTen.trim()) {
      toast.error("Vui lòng nhập họ tên khách hàng");
      return;
    }
    if (!formData.sdt.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await khachHangService.createKhachHang(formData);
      if (res.success && res.data) {
        toast.success("Thêm khách hàng thành công");
        onSuccess(res.data);
        setFormData(initialForm);
        onClose();
      } else {
        toast.error(res.message || "Lỗi khi thêm khách hàng");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Có lỗi xảy ra khi thêm khách hàng";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Thêm khách hàng mới
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Đăng ký thông tin thành viên POS</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ và tên *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FiUser size={16} />
              </span>
              <input
                type="text"
                required
                value={formData.hoTen}
                onChange={(e) => setFormData((prev) => ({ ...prev, hoTen: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nhập tên khách hàng..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <FiPhone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  value={formData.sdt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sdt: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Giới tính</label>
              <select
                value={formData.gioiTinh}
                onChange={(e) => setFormData((prev) => ({ ...prev, gioiTinh: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FiMail size={16} />
              </span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày sinh</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FiCalendar size={16} />
              </span>
              <input
                type="date"
                value={formData.ngaySinh}
                onChange={(e) => setFormData((prev) => ({ ...prev, ngaySinh: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Địa chỉ</label>
            <div className="relative">
              <span className="absolute inset-y-2 left-0 pl-3 flex items-start text-gray-400 pointer-events-none">
                <FiMapPin size={16} className="mt-0.5" />
              </span>
              <textarea
                value={formData.diaChi}
                onChange={(e) => setFormData((prev) => ({ ...prev, diaChi: e.target.value }))}
                rows={2}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Địa chỉ liên hệ..."
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
