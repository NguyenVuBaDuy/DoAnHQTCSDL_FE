import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCreateNhaCungCap, useUpdateNhaCungCap } from "../hooks/useNhaCungCap";
import type { NhaCungCap, CreateNhaCungCapRequest } from "../../../types/nha-cung-cap";

interface NhaCungCapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: NhaCungCap | null;
  onSuccessAction?: () => void;
}

const NhaCungCapModal = ({
  isOpen,
  onClose,
  initialData,
  onSuccessAction,
}: NhaCungCapModalProps) => {
  const createMutation = useCreateNhaCungCap();
  const updateMutation = useUpdateNhaCungCap();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateNhaCungCapRequest>({
    tenNcc: "",
    diaChi: "",
    sdt: "",
    email: "",
    maSoThue: "",
    trangThai: "HoatDong",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          tenNcc: initialData.tenNcc,
          diaChi: initialData.diaChi || "",
          sdt: initialData.sdt || "",
          email: initialData.email || "",
          maSoThue: initialData.maSoThue || "",
          trangThai: initialData.trangThai || "HoatDong",
        });
      } else {
        setFormData({
          tenNcc: "",
          diaChi: "",
          sdt: "",
          email: "",
          maSoThue: "",
          trangThai: "HoatDong",
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
    const tenNccTrimmed = formData.tenNcc.trim();
    if (tenNccTrimmed.length < 2) {
      toast.error("Tên nhà cung cấp phải từ 2 ký tự trở lên");
      return;
    }

    if (formData.sdt && !/^0\d{9}$/.test(formData.sdt)) {
      toast.error(
        "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có đúng 10 chữ số)",
      );
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    const mutationFn = isEditMode
      ? () =>
          updateMutation.mutateAsync({
            id: initialData.maNcc,
            data: formData,
          })
      : () => createMutation.mutateAsync(formData);

    mutationFn()
      .then(() => {
        onClose();
        toast.success(
          isEditMode
            ? "Cập nhật nhà cung cấp thành công!"
            : "Thêm nhà cung cấp thành công!",
        );
        if (onSuccessAction) onSuccessAction();
      })
      .catch((error: any) => {
        console.error("Lỗi khi lưu nhà cung cấp:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi lưu nhà cung cấp.";
        toast.error(errorMessage);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
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
            id="supplier-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Tên nhà cung cấp */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenNcc"
                required
                value={formData.tenNcc}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập tên nhà cung cấp..."
              />
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="text"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập số điện thoại..."
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập email..."
              />
            </div>

            {/* Mã số thuế */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mã số thuế
              </label>
              <input
                type="text"
                name="maSoThue"
                value={formData.maSoThue}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập mã số thuế..."
              />
            </div>

            {/* Trạng thái */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                name="trangThai"
                required
                value={formData.trangThai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="HoatDong">Hoạt động</option>
                <option value="DungHopTac">Dừng hợp tác</option>
              </select>
            </div>

            {/* Địa chỉ */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <textarea
                name="diaChi"
                rows={3}
                value={formData.diaChi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                placeholder="Nhập địa chỉ của nhà cung cấp..."
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
            form="supplier-form"
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

export default NhaCungCapModal;
