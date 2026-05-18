import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useCreateCuaHang } from "../hooks/useCuaHang";
import type { CreateCuaHangRequest } from "../../../types/cua-hang";
import { toast } from "react-hot-toast";

interface CuaHangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAction?: () => void;
}

const initialFormData: CreateCuaHangRequest = {
  tenCh: "",
  diaChi: "",
  sdt: "",
  email: "",
  ngayKhaiTruong: "",
  trangThai: "HoatDong",
};

export const CuaHangModal = ({
  isOpen,
  onClose,
  onSuccessAction,
}: CuaHangModalProps) => {
  const [formData, setFormData] =
    useState<CreateCuaHangRequest>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCuaHang();

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.tenCh.trim()) newErrors.tenCh = "Tên cửa hàng là bắt buộc";
    if (!formData.diaChi.trim()) newErrors.diaChi = "Địa chỉ là bắt buộc";

    if (!formData.sdt.trim()) {
      newErrors.sdt = "Số điện thoại là bắt buộc";
    } else if (!/^0\d{9}$/.test(formData.sdt)) {
      newErrors.sdt =
        "Số điện thoại không hợp lệ (bắt đầu bằng 0 và có 10 chữ số)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.ngayKhaiTruong)
      newErrors.ngayKhaiTruong = "Ngày khai trương là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Thêm cửa hàng thành công!");
        setFormData(initialFormData);
        onClose();
        if (onSuccessAction) onSuccessAction();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Có lỗi xảy ra khi thêm cửa hàng";
        toast.error(message);
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Thêm Cửa Hàng Mới</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form
            id="add-cuahang-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Tên cửa hàng */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Tên cửa hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenCh"
                value={formData.tenCh}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                  errors.tenCh
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Nhập tên cửa hàng..."
              />
              {errors.tenCh && (
                <p className="text-xs text-red-500">{errors.tenCh}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                  errors.sdt
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Nhập số điện thoại..."
              />
              {errors.sdt && (
                <p className="text-xs text-red-500">{errors.sdt}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Nhập địa chỉ email..."
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Ngày khai trương */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ngày khai trương <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngayKhaiTruong"
                value={formData.ngayKhaiTruong}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                  errors.ngayKhaiTruong
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.ngayKhaiTruong && (
                <p className="text-xs text-red-500">{errors.ngayKhaiTruong}</p>
              )}
            </div>

            {/* Trạng thái */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="HoatDong">Đang hoạt động</option>
                <option value="TamNgung">Tạm ngưng</option>
                <option value="DongCua">Đóng cửa</option>
              </select>
            </div>

            {/* Địa chỉ */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diaChi"
                rows={3}
                value={formData.diaChi}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none ${
                  errors.diaChi
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Nhập địa chỉ cửa hàng..."
              />
              {errors.diaChi && (
                <p className="text-xs text-red-500">{errors.diaChi}</p>
              )}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="add-cuahang-form"
            disabled={createMutation.isPending}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createMutation.isPending ? "Đang xử lý..." : "Xác nhận thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};
