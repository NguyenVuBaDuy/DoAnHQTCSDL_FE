import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCreateNhanVien, useUpdateNhanVien } from "../hooks/useNhanVien";
import { roles } from "../../../utils/roleUtils";
import { useAppSelector } from "../../../store";
import type { CuaHang } from "../../../types/cua-hang";
import type { CreateNhanVienRequest } from "../../../types/nhan-vien";

interface NhanVienModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuaHangs: CuaHang[];
  initialData?: import("../../../types/nhan-vien").NhanVienListItem | null;
  onSuccessAction?: () => void;
}

const NhanVienModal = ({
  isOpen,
  onClose,
  cuaHangs,
  initialData,
  onSuccessAction,
}: NhanVienModalProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom; // "Admin", "QuanLyCuaHang", etc.
  const userMaCh = user?.nhanvien?.mach;

  const createMutation = useCreateNhanVien();
  const updateMutation = useUpdateNhanVien();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateNhanVienRequest>({
    hoTen: "",
    cccd: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    sdt: "",
    diaChi: "",
    chucVu: "NhanVienBan",
    maCh: 0,
    tenNhom: "NhanVienBan",
    password: "",
    trangThai: "HoatDong",
  });

  // Reset form and set default maCh when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          hoTen: initialData.hoTen,
          cccd: initialData.cccd,
          ngaySinh: initialData.ngaySinh,
          gioiTinh: initialData.gioiTinh,
          sdt: initialData.sdt,
          diaChi: initialData.diaChi,
          chucVu: initialData.chucVu,
          maCh: initialData.maCh,
          tenNhom: initialData.tenNhom,
          password: "", // Keep empty for password update, assuming backend handles empty as no change or user has to provide it
          trangThai: initialData.trangThai,
        });
      } else {
        setFormData({
          hoTen: "",
          cccd: "",
          ngaySinh: "",
          gioiTinh: "Nam",
          sdt: "",
          diaChi: "",
          chucVu: "NhanVienBan",
          maCh:
            role !== "Admin" && userMaCh
              ? userMaCh
              : cuaHangs.length > 0
                ? cuaHangs[0].maCh
                : 0,
          tenNhom: "NhanVienBan",
          password: "",
          trangThai: "HoatDong",
        });
      }
    }
  }, [isOpen, role, userMaCh, cuaHangs, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: name === "maCh" ? Number(value) : value,
      };
      if (name === "chucVu") {
        newData.tenNhom = value; // Sync tenNhom with chucVu
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const hoTenTrimmed = formData.hoTen.trim();
    if (hoTenTrimmed.split(/\s+/).length < 2) {
      toast.error("Họ tên phải từ 2 chữ trở lên");
      return;
    }
    if (hoTenTrimmed.length >= 40) {
      toast.error("Họ tên phải dưới 40 ký tự");
      return;
    }

    if (!/^\d{12}$/.test(formData.cccd)) {
      toast.error("CCCD phải bao gồm đúng 12 chữ số");
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
            maNv: initialData.maNv,
            data: formData,
          })
      : () => createMutation.mutateAsync(formData);

    mutationFn()
      .then(() => {
        onClose();
        toast.success(
          isEditMode
            ? "Cập nhật nhân viên thành công!"
            : "Thêm nhân viên thành công!",
        );
        if (onSuccessAction) onSuccessAction();
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error("Lỗi khi lưu nhân viên:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi lưu nhân viên.";
        toast.error(errorMessage);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
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
            id="add-nhanvien-form"
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

            {/* CCCD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                CCCD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cccd"
                required
                value={formData.cccd}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập số CCCD..."
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

            {/* Mật khẩu */}
            {!isEditMode && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Nhập mật khẩu..."
                />
              </div>
            )}

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
                <option value="KhoaTam">Khóa tạm</option>
                <option value="KhoaCung">Khóa cứng</option>
              </select>
            </div>

            {/* Chức vụ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Chức vụ <span className="text-red-500">*</span>
              </label>
              <select
                name="chucVu"
                required
                value={formData.chucVu}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                {roles
                  .filter(
                    (r) =>
                      r.value !== "Admin" &&
                      (role === "Admin" || r.value !== "QuanLyCuaHang"),
                  )
                  .map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
              </select>
            </div>

            {/* Cửa hàng */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Cửa hàng <span className="text-red-500">*</span>
              </label>
              <select
                name="maCh"
                required
                disabled={role !== "Admin"}
                value={formData.maCh}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                {cuaHangs.map((ch) => (
                  <option key={ch.maCh} value={ch.maCh}>
                    {ch.tenCh}
                  </option>
                ))}
              </select>
              {role !== "Admin" && (
                <p className="text-xs text-gray-500 mt-1">
                  Chỉ admin mới có quyền chọn cửa hàng khác.
                </p>
              )}
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
            form="add-nhanvien-form"
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

export default NhanVienModal;
