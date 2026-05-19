import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCreateKhachHang, useUpdateKhachHang } from "../hooks/useKhachHang";
import type { KhachHang, CreateKhachHangRequest } from "../../../types/khach-hang";

interface KhachHangModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: KhachHang | null;
  onSuccessAction?: () => void;
}

const KhachHangModal = ({
  isOpen,
  onClose,
  initialData,
  onSuccessAction,
}: KhachHangModalProps) => {
  const createMutation = useCreateKhachHang();
  const updateMutation = useUpdateKhachHang();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateKhachHangRequest>({
    hoTen: "",
    sdt: "",
    email: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    diaChi: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          hoTen: initialData.hoTen,
          sdt: initialData.sdt,
          email: initialData.email,
          ngaySinh: initialData.ngaySinh ? initialData.ngaySinh.split("T")[0] : "",
          gioiTinh: initialData.gioiTinh,
          diaChi: initialData.diaChi,
        });
      } else {
        setFormData({
          hoTen: "",
          sdt: "",
          email: "",
          ngaySinh: "",
          gioiTinh: "Nam",
          diaChi: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const hoTenTrimmed = formData.hoTen.trim();
    if (hoTenTrimmed.split(/\s+/).length < 2) {
      toast.error("Họ tên phải từ 2 từ trở lên");
      return;
    }
    if (hoTenTrimmed.length >= 20) {
      toast.error("Họ tên phải dưới 20 ký tự");
      return;
    }

    if (!/^0\d{9}$/.test(formData.sdt)) {
      toast.error(
        "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có đúng 10 chữ số)",
      );
      return;
    }

    const mutationFn = isEditMode
      ? () =>
          updateMutation.mutateAsync({
            id: initialData.maKh,
            data: formData,
          })
      : () => createMutation.mutateAsync(formData);

    mutationFn()
      .then(() => {
        onClose();
        toast.success(
          isEditMode
            ? "Cập nhật khách hàng thành công!"
            : "Thêm khách hàng thành công!",
        );
        if (onSuccessAction) onSuccessAction();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error("Lỗi khi lưu khách hàng:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi lưu khách hàng.";
        toast.error(errorMessage);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form
            id="add-khachhang-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Họ tên */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hoTen"
                required
                value={formData.hoTen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập họ và tên..."
              />
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sdt"
                required
                value={formData.sdt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập số điện thoại..."
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập email..."
              />
            </div>

            {/* Ngày sinh */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngaySinh"
                required
                value={formData.ngaySinh}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="gioiTinh"
                required
                value={formData.gioiTinh}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Địa chỉ */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diaChi"
                required
                rows={3}
                value={formData.diaChi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                placeholder="Nhập địa chỉ cư trú..."
              />
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
            form="add-khachhang-form"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Đang xử lý..."
              : isEditMode
                ? "Cập nhật"
                : "Xác nhận thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KhachHangModal;
