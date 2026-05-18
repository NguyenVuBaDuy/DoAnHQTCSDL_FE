import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useCreateCuaHang } from "../hooks/useCuaHang";
import type { CreateCuaHangRequest } from "../../../types/cua-hang";
import { toast } from "react-hot-toast";

interface CuaHangModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData: CreateCuaHangRequest = {
  tenCh: "",
  diaChi: "",
  sdt: "",
  email: "",
  ngayKhaiTruong: "",
  trangThai: "HoatDong",
};

export const CuaHangModal = ({ isOpen, onClose }: CuaHangModalProps) => {
  const [formData, setFormData] =
    useState<CreateCuaHangRequest>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCuaHang();

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.tenCh.trim()) newErrors.tenCh = "Tên cửa hàng là bắt buộc";
    if (!formData.diaChi.trim()) newErrors.diaChi = "Địa chỉ là bắt buộc";
    if (!formData.sdt.trim()) newErrors.sdt = "Số điện thoại là bắt buộc";
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
    if (!validateForm()) return;

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Thêm cửa hàng thành công!");
        setFormData(initialFormData);
        onClose();
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Thêm Cửa Hàng Mới
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên cửa hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenCh"
                value={formData.tenCh}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.tenCh
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Nhập tên cửa hàng"
              />
              {errors.tenCh && (
                <p className="mt-1 text-sm text-red-500">{errors.tenCh}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="diaChi"
                value={formData.diaChi}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.diaChi
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Nhập địa chỉ"
              />
              {errors.diaChi && (
                <p className="mt-1 text-sm text-red-500">{errors.diaChi}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.sdt
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Nhập số điện thoại"
              />
              {errors.sdt && (
                <p className="mt-1 text-sm text-red-500">{errors.sdt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày khai trương <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngayKhaiTruong"
                value={formData.ngayKhaiTruong}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.ngayKhaiTruong
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.ngayKhaiTruong && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.ngayKhaiTruong}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="HoatDong">Đang hoạt động</option>
                <option value="TamNgung">Tạm ngưng</option>
                <option value="DongCua">Đóng cửa</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {createMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Thêm mới"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
