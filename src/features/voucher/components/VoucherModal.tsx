import { useState, useEffect } from "react";
import { FiX, FiCalendar, FiTag, FiDollarSign, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCreateVoucher, useUpdateVoucher } from "../hooks/useVoucher";
import type { VoucherResponse, VoucherRequest } from "../../../types/voucher";

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: VoucherResponse | null;
  onSuccessAction?: () => void;
  readOnly?: boolean;
}

const formatISOToDateTimeLocal = (isoString?: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    
    // Convert to local YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
};

const formatDateTimeLocalToISO = (localString?: string): string => {
  if (!localString) return "";
  try {
    return new Date(localString).toISOString();
  } catch (e) {
    return "";
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const VoucherModal = ({
  isOpen,
  onClose,
  initialData,
  onSuccessAction,
  readOnly = false,
}: VoucherModalProps) => {
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<Partial<VoucherRequest>>({
    maVoucher: "",
    tenVoucher: "",
    loai: "PhanTram",
    giaTri: 0,
    giaTriToiDa: undefined,
    dieuKienToiThieu: 0,
    soLuong: 100,
    soLuongDaDung: 0,
    ngayBatDau: "",
    ngayHetHan: "",
    trangThai: "KichHoat",
    ghiChu: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          maVoucher: initialData.maVoucher,
          tenVoucher: initialData.tenVoucher,
          loai: initialData.loai,
          giaTri: initialData.giaTri,
          giaTriToiDa: initialData.giaTriToiDa || undefined,
          dieuKienToiThieu: initialData.dieuKienToiThieu || 0,
          soLuong: initialData.soLuong,
          soLuongDaDung: initialData.soLuongDaDung || 0,
          ngayBatDau: formatISOToDateTimeLocal(initialData.ngayBatDau),
          ngayHetHan: formatISOToDateTimeLocal(initialData.ngayHetHan),
          trangThai: initialData.trangThai,
          ghiChu: initialData.ghiChu || "",
        });
      } else {
        // Set default dates: start now, end in 30 days
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);

        setFormData({
          maVoucher: "",
          tenVoucher: "",
          loai: "PhanTram",
          giaTri: 10,
          giaTriToiDa: undefined,
          dieuKienToiThieu: 0,
          soLuong: 100,
          soLuongDaDung: 0,
          ngayBatDau: formatISOToDateTimeLocal(start.toISOString()),
          ngayHetHan: formatISOToDateTimeLocal(end.toISOString()),
          trangThai: "KichHoat",
          ghiChu: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    if (readOnly) return;
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: parsedValue,
      };

      // Reset max discount if switching to Cash discount
      if (name === "loai" && parsedValue === "TienMat") {
        updated.giaTriToiDa = undefined;
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    // Validation
    const code = (formData.maVoucher || "").trim().toUpperCase();
    if (!code) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (!isEditMode && !/^[A-Z0-9_-]{3,20}$/.test(code)) {
      toast.error("Mã voucher chỉ được chứa chữ in hoa, số, gạch nối (- hoặc _) và từ 3-20 ký tự");
      return;
    }

    const name = (formData.tenVoucher || "").trim();
    if (name.length < 3) {
      toast.error("Tên voucher phải từ 3 ký tự trở lên");
      return;
    }

    const value = Number(formData.giaTri);
    if (isNaN(value) || value <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    if (formData.loai === "PhanTram" && value > 100) {
      toast.error("Phần trăm giảm giá không thể vượt quá 100%");
      return;
    }

    const minCondition = Number(formData.dieuKienToiThieu || 0);
    if (minCondition < 0) {
      toast.error("Điều kiện đơn hàng tối thiểu không thể âm");
      return;
    }

    if (formData.loai === "PhanTram" && formData.giaTriToiDa !== undefined && Number(formData.giaTriToiDa) <= 0) {
      toast.error("Giá trị giảm tối đa phải lớn hơn 0");
      return;
    }

    const totalQty = Number(formData.soLuong);
    if (isNaN(totalQty) || totalQty <= 0) {
      toast.error("Số lượng voucher phát hành phải lớn hơn 0");
      return;
    }

    if (!formData.ngayBatDau || !formData.ngayHetHan) {
      toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày hết hạn");
      return;
    }

    const start = new Date(formData.ngayBatDau);
    const end = new Date(formData.ngayHetHan);
    if (end <= start) {
      toast.error("Ngày hết hạn phải xảy ra sau ngày bắt đầu");
      return;
    }

    const requestPayload: VoucherRequest = {
      maVoucher: code,
      tenVoucher: name,
      loai: formData.loai || "PhanTram",
      giaTri: value,
      giaTriToiDa: formData.loai === "PhanTram" ? (formData.giaTriToiDa || undefined) : undefined,
      dieuKienToiThieu: minCondition,
      soLuong: totalQty,
      soLuongDaDung: formData.soLuongDaDung || 0,
      ngayBatDau: formatDateTimeLocalToISO(formData.ngayBatDau),
      ngayHetHan: formatDateTimeLocalToISO(formData.ngayHetHan),
      trangThai: formData.trangThai || "KichHoat",
      ghiChu: formData.ghiChu || "",
    };

    const mutationFn = isEditMode
      ? () =>
          updateMutation.mutateAsync({
            code: initialData.maVoucher,
            data: requestPayload,
          })
      : () => createMutation.mutateAsync(requestPayload);

    mutationFn()
      .then(() => {
        onClose();
        toast.success(
          isEditMode
            ? "Cập nhật voucher thành công!"
            : "Thêm voucher mới thành công!",
        );
        if (onSuccessAction) onSuccessAction();
      })
      .catch((error: any) => {
        console.error("Lỗi khi lưu voucher:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi lưu thông tin voucher.";
        toast.error(errorMessage);
      });
  };

  // Generate Voucher Preview
  const getPreviewText = () => {
    const type = formData.loai;
    const value = formData.giaTri || 0;
    const max = formData.giaTriToiDa;
    const min = formData.dieuKienToiThieu || 0;

    let text = "";
    if (type === "PhanTram") {
      text = `Giảm ${value}%`;
      if (max) text += ` (tối đa ${formatCurrency(max)})`;
    } else {
      text = `Giảm thẳng ${formatCurrency(value)}`;
    }

    if (min > 0) {
      text += ` cho hóa đơn từ ${formatCurrency(min)}`;
    } else {
      text += ` cho mọi hóa đơn`;
    }

    return text;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiTag className="text-[#0057AD]" />
            {readOnly 
              ? `Chi tiết Voucher: ${formData.maVoucher}` 
              : isEditMode 
                ? `Cập nhật Voucher: ${formData.maVoucher}` 
                : "Thêm Voucher Khuyến Mãi Mới"
            }
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Real-time Voucher Summary Preview Badge */}
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
            <FiInfo className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider block">Tóm tắt khuyến mãi (Xem trước)</span>
              <span className="text-sm font-extrabold text-blue-900 mt-1 block">
                {formData.maVoucher ? `[${formData.maVoucher.trim().toUpperCase()}] ` : ""}
                {formData.tenVoucher ? `"${formData.tenVoucher.trim()}" — ` : ""}
                {getPreviewText()}
              </span>
            </div>
          </div>

          <form
            id="voucher-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Mã Voucher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="maVoucher"
                required
                disabled={isEditMode || readOnly}
                value={formData.maVoucher}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  handleChange(e);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono uppercase placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="Ví dụ: HELLO2026"
              />
              {!isEditMode && !readOnly && (
                <span className="text-[11px] text-gray-400 font-medium">Viết liền không dấu, từ 3-20 ký tự</span>
              )}
            </div>

            {/* Tên Voucher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Tên chương trình / Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenVoucher"
                required
                disabled={readOnly}
                value={formData.tenVoucher}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="Ví dụ: Giảm giá hè rực rỡ"
              />
            </div>

            {/* Loại Voucher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Hình thức giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                name="loai"
                required
                disabled={readOnly}
                value={formData.loai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white font-medium text-gray-700 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="PhanTram">Phần trăm (%)</option>
                <option value="TienMat">Khấu trừ tiền mặt (đ)</option>
              </select>
            </div>

            {/* Giá trị giảm */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="giaTri"
                  required
                  min={1}
                  disabled={readOnly}
                  max={formData.loai === "PhanTram" ? 100 : undefined}
                  value={formData.giaTri}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="Nhập con số giảm..."
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  {formData.loai === "PhanTram" ? "%" : "VND"}
                </span>
              </div>
            </div>

            {/* Điều kiện tối thiểu */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Đơn hàng tối thiểu (đ)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  <FiDollarSign />
                </span>
                <input
                  type="number"
                  name="dieuKienToiThieu"
                  min={0}
                  disabled={readOnly}
                  value={formData.dieuKienToiThieu}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="0 (Không giới hạn)"
                />
              </div>
            </div>

            {/* Giảm tối đa (Chỉ hiển thị nếu loại là Phần Trăm) */}
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-sm font-semibold transition-colors duration-200 ${
                  formData.loai === "PhanTram" && !readOnly ? "text-gray-700" : "text-gray-400"
                }`}
              >
                Mức giảm tối đa (đ)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  <FiDollarSign />
                </span>
                <input
                  type="number"
                  name="giaTriToiDa"
                  disabled={formData.loai !== "PhanTram" || readOnly}
                  value={formData.giaTriToiDa || ""}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  placeholder={formData.loai === "PhanTram" ? "Không giới hạn" : "Chỉ áp dụng với Phần trăm"}
                />
              </div>
            </div>

            {/* Số lượng phát hành */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Số lượng phát hành <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="soLuong"
                required
                min={1}
                disabled={readOnly}
                value={formData.soLuong}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            {/* Trạng thái */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Trạng thái hoạt động <span className="text-red-500">*</span>
              </label>
              <select
                name="trangThai"
                required
                disabled={readOnly}
                value={formData.trangThai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="KichHoat">Kích hoạt (Khả dụng)</option>
                <option value="VoHieu">Vô hiệu hóa (Khóa)</option>
              </select>
            </div>

            {/* Ngày bắt đầu */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <FiCalendar className="text-gray-400" />
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="ngayBatDau"
                required
                disabled={readOnly}
                value={formData.ngayBatDau}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            {/* Ngày kết thúc */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <FiCalendar className="text-gray-400" />
                Ngày hết hạn <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="ngayHetHan"
                required
                disabled={readOnly}
                value={formData.ngayHetHan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            {/* Ghi chú */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Ghi chú chương trình
              </label>
              <textarea
                name="ghiChu"
                rows={2}
                disabled={readOnly}
                value={formData.ghiChu}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="Mô tả hoặc lưu ý thêm về đợt khuyến mãi này..."
              />
            </div>
          </form>
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {readOnly ? "Đóng" : "Hủy bỏ"}
          </button>
          {!readOnly && (
            <button
              type="submit"
              form="voucher-form"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Đang lưu..."
                : isEditMode
                  ? "Lưu cập nhật"
                  : "Thêm Voucher"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
