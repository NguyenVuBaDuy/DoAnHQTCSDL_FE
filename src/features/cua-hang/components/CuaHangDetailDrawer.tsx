import { FiX, FiInfo, FiUsers, FiEdit2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { CuaHang, CreateCuaHangRequest } from "../../../types/cua-hang";
import { useGetCuaHangById, useUpdateCuaHang } from "../hooks/useCuaHang";
import { toast } from "react-hot-toast";

interface CuaHangDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cuaHang: CuaHang | null;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "Chưa có thông tin";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return format(date, "dd/MM/yyyy");
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status: string) => {
  if (status === "HoatDong" || !status) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        HOẠT ĐỘNG
      </span>
    );
  }
  if (status === "TamNgung") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        TẠM NGƯNG
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
      ĐÓNG CỬA
    </span>
  );
};

const getStatusLabel = (status: string) => {
  if (status === "HoatDong" || !status) return "Hoạt động";
  if (status === "TamNgung") return "Tạm ngưng";
  return "Đóng cửa";
};

const CuaHangDetailDrawer = ({
  isOpen,
  onClose,
  cuaHang,
}: CuaHangDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateCuaHangRequest>({
    tenCh: "",
    diaChi: "",
    sdt: "",
    email: "",
    ngayKhaiTruong: "",
    trangThai: "HoatDong",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: detailResponse, isLoading } = useGetCuaHangById(
    isOpen ? cuaHang?.maCh : undefined,
  );
  const displayCuaHang = detailResponse?.data || cuaHang;
  const updateMutation = useUpdateCuaHang();

  useEffect(() => {
    if (displayCuaHang && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        tenCh: displayCuaHang.tenCh || "",
        diaChi: displayCuaHang.diaChi || "",
        sdt: displayCuaHang.sdt || "",
        email: displayCuaHang.email || "",
        ngayKhaiTruong: displayCuaHang.ngayKhaiTruong
          ? displayCuaHang.ngayKhaiTruong.split("T")[0]
          : "",
        trangThai: displayCuaHang.trangThai || "HoatDong",
      });
      setErrors({});
    }
  }, [displayCuaHang, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditMode(false);
      setActiveTab("info");
    }
  }, [isOpen]);

  if (!isOpen || !cuaHang) return null;

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

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
    if (!displayCuaHang) return;

    updateMutation.mutate(
      { id: displayCuaHang.maCh, data: formData },
      {
        onSuccess: () => {
          toast.success("Cập nhật cửa hàng thành công!");
          setIsEditMode(false);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Có lỗi xảy ra khi cập nhật";
          toast.error(message);
        },
      },
    );
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
              Chi tiết cửa hàng
            </h2>
            <div className="flex items-center gap-2">
              {!isEditMode && activeTab === "info" && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit2 size={14} />
                  Sửa
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white px-6">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "info"
                  ? "border-[#0057AD] text-[#0057AD]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                if (!isEditMode) setActiveTab("info");
              }}
              disabled={isEditMode}
            >
              Thông tin
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "staff"
                  ? "border-[#0057AD] text-[#0057AD]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                if (!isEditMode) setActiveTab("staff");
              }}
              disabled={isEditMode}
            >
              Nhân viên
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading && !displayCuaHang ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : activeTab === "info" && displayCuaHang ? (
              <>
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {isEditMode ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            name="tenCh"
                            value={formData.tenCh}
                            onChange={handleChange}
                            placeholder="Tên cửa hàng"
                            className={`w-full text-lg font-bold px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tenCh ? "border-red-500" : "border-gray-300"}`}
                          />
                          {errors.tenCh && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.tenCh}
                            </p>
                          )}
                        </div>
                      ) : (
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                          {displayCuaHang.tenCh}
                        </h3>
                      )}
                    </div>
                    {!isEditMode && getStatusBadge(displayCuaHang.trangThai)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">
                      Mã CH: CH-{displayCuaHang.maCh}
                    </span>
                    <span className="text-gray-300">•</span>
                    {isEditMode ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <input
                          type="date"
                          name="ngayKhaiTruong"
                          value={formData.ngayKhaiTruong}
                          onChange={handleChange}
                          className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ngayKhaiTruong ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.ngayKhaiTruong && (
                          <p className="text-xs text-red-500">
                            {errors.ngayKhaiTruong}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Khai trương: {formatDate(displayCuaHang.ngayKhaiTruong)}
                      </span>
                    )}
                  </div>
                </div>

                {/* THÔNG TIN LIÊN HỆ */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                    Thông tin liên hệ
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                    <div className="flex flex-col">
                      <div
                        className={`flex ${isEditMode ? "flex-col" : "items-center justify-between"} p-4 border-b border-gray-100 gap-2`}
                      >
                        <span className="text-sm font-medium text-gray-500 min-w-24">
                          Địa chỉ
                        </span>
                        {isEditMode ? (
                          <div className="w-full">
                            <textarea
                              name="diaChi"
                              rows={2}
                              value={formData.diaChi}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${errors.diaChi ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.diaChi && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.diaChi}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span
                            className="text-sm font-semibold text-gray-900 text-right max-w-[60%] line-clamp-2"
                            title={displayCuaHang.diaChi}
                          >
                            {displayCuaHang.diaChi}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex ${isEditMode ? "flex-col" : "items-center justify-between"} p-4 border-b border-gray-100 gap-2`}
                      >
                        <span className="text-sm font-medium text-gray-500 min-w-24">
                          Số điện thoại
                        </span>
                        {isEditMode ? (
                          <div className="w-full">
                            <input
                              type="text"
                              name="sdt"
                              value={formData.sdt}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.sdt ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.sdt && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.sdt}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">
                            {displayCuaHang.sdt}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex ${isEditMode ? "flex-col" : "items-center justify-between"} p-4 gap-2`}
                      >
                        <span className="text-sm font-medium text-gray-500 min-w-24">
                          Email quản lý
                        </span>
                        {isEditMode ? (
                          <div className="w-full">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.email && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span
                            className="text-sm font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-xs"
                            title={displayCuaHang.email}
                          >
                            {displayCuaHang.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HIỆU SUẤT THÁNG NÀY (Không hiển thị trong Edit Mode vì không sửa được) */}
                {!isEditMode && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                      Hiệu suất tháng này
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Doanh thu
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          285M
                        </span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Đơn hàng
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          1,420
                        </span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Tỉ lệ hoàn
                        </span>
                        <span className="text-sm font-bold text-[#16A34A]">
                          2.1%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TRẠNG THÁI */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-bold text-[#0057AD] uppercase tracking-wide">
                    Trạng thái
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-gray-900">
                            Trạng thái hoạt động
                          </span>
                          <span className="text-[13px] text-gray-500">
                            Trạng thái hiện tại của cửa hàng
                          </span>
                        </div>
                        {isEditMode ? (
                          <select
                            name="trangThai"
                            value={formData.trangThai}
                            onChange={handleChange}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                          >
                            <option value="HoatDong">Đang hoạt động</option>
                            <option value="TamNgung">Tạm ngưng</option>
                            <option value="DongCua">Đóng cửa</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              displayCuaHang.trangThai === "HoatDong" ||
                              !displayCuaHang.trangThai
                                ? "bg-green-100 text-green-800"
                                : displayCuaHang.trangThai === "TamNgung"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getStatusLabel(displayCuaHang.trangThai)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 p-4 bg-gray-50">
                        <FiInfo className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Đóng cửa chi nhánh sẽ ẩn tất cả dữ liệu bán hàng khỏi
                          báo cáo chung và khóa quyền truy cập của nhân viên.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <FiUsers size={40} className="mb-4 text-gray-300" />
                <p>Danh sách nhân viên sẽ hiển thị ở đây.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === "info" && (
            <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setErrors({});
                      if (displayCuaHang) {
                        setFormData({
                          tenCh: displayCuaHang.tenCh,
                          diaChi: displayCuaHang.diaChi,
                          sdt: displayCuaHang.sdt,
                          email: displayCuaHang.email,
                          ngayKhaiTruong: displayCuaHang.ngayKhaiTruong
                            ? displayCuaHang.ngayKhaiTruong.split("T")[0]
                            : "",
                          trangThai: displayCuaHang.trangThai || "HoatDong",
                        });
                      }
                    }}
                    className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={updateMutation.isPending}
                    className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2"
                  >
                    {updateMutation.isPending
                      ? "Đang xử lý..."
                      : "Lưu thay đổi"}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Đóng
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CuaHangDetailDrawer;
