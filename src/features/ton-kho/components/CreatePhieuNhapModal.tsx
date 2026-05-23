import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { sanPhamService } from "../../../services/sanPhamService";
import { tonKhoService } from "../../../services/tonKhoService";
import type { CuaHang } from "../../../types/cua-hang";
import type { NhaCungCap } from "../../../types/nha-cung-cap";
import type {
  ChiTietPhieuNhapRequest,
  CreatePhieuNhapRequest,
} from "../../../types/phieu-nhap";
import { useGetNhaCungCaps } from "../hooks/useNhaCungCap";
import { useCreatePhieuNhap } from "../hooks/usePhieuNhap";

interface CreatePhieuNhapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: string;
  userStoreId?: number;
  cuaHangs: CuaHang[];
  isCuaHangsLoading: boolean;
}

const initialChiTiet: ChiTietPhieuNhapRequest = {
  maBienThe: 0,
  soLuong: 1,
  donGia: 0,
};

const initialFormData: CreatePhieuNhapRequest = {
  maCh: 0,
  maNcc: undefined,
  ghiChu: "",
  chiTiet: [{ ...initialChiTiet }],
};

export const CreatePhieuNhapModal = ({
  isOpen,
  onClose,
  onSuccess,
  role,
  userStoreId,
  cuaHangs,
  isCuaHangsLoading,
}: CreatePhieuNhapModalProps) => {
  const isAdmin = role === "Admin";
  const createMutation = useCreatePhieuNhap();
  const { data: nhaCungCapsResponse, isLoading: isNhaCungCapsLoading } =
    useGetNhaCungCaps();

  const nhaCungCaps: NhaCungCap[] = nhaCungCapsResponse?.data || [];
  const [formData, setFormData] =
    useState<CreatePhieuNhapRequest>(initialFormData);

  const selectedStoreId = formData.maCh || undefined;
  const { data: bienTheResponse, isLoading: isBienTheLoading } = useQuery({
    queryKey: ["create-phieu-nhap-bien-the-public"],
    queryFn: () =>
      sanPhamService.getAllBienThe({
        page: 1,
        size: 1000,
      }),
    enabled: isOpen,
  });

  const bienTheOptions = bienTheResponse?.data?.content || [];
  const isTonKhoLoading = isBienTheLoading;


  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      maCh:
        !isAdmin && userStoreId
          ? userStoreId
          : cuaHangs.length > 0
            ? cuaHangs[0].maCh
            : 0,
      maNcc: nhaCungCaps.length > 0 ? nhaCungCaps[0].maNcc : undefined,
      ghiChu: "",
      chiTiet: [{ ...initialChiTiet }],
    });
  }, [isOpen, isAdmin, userStoreId, cuaHangs, nhaCungCaps]);

  if (!isOpen) return null;

  const getStoreLabel = () => {
    if (isAdmin) return "Chọn cửa hàng";
    if (userStoreId) return `Cửa hàng của bạn: #${userStoreId}`;
    return "Cửa hàng không xác định";
  };

  const setFieldValue = (
    name: keyof CreatePhieuNhapRequest,
    value: string | number | undefined,
  ) => {
    const numericValue =
      typeof value === "number"
        ? value
        : value === "" || value === undefined
          ? undefined
          : Number(value);

    setFormData((prev) => ({
      ...prev,
      [name]: name === "maCh" || name === "maNcc" ? numericValue : value,
    }));
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "maCh" || name === "maNcc") {
      setFieldValue(name as keyof CreatePhieuNhapRequest, value);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChiTietChange = (
    index: number,
    field: keyof ChiTietPhieuNhapRequest,
    value: string,
  ) => {
    const parsedValue = value === "" ? 0 : Number(value);

    setFormData((prev) => ({
      ...prev,
      chiTiet: prev.chiTiet.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: parsedValue,
            }
          : item,
      ),
    }));
  };

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      chiTiet: [...prev.chiTiet, { ...initialChiTiet }],
    }));
  };

  const handleRemoveRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      chiTiet: prev.chiTiet.filter((_, idx) => idx !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.maCh || formData.maCh <= 0) {
      toast.error("Vui lòng chọn cửa hàng");
      return false;
    }

    const validRows = formData.chiTiet.filter(
      (item) => item.maBienThe > 0 && item.soLuong > 0 && item.donGia > 0,
    );

    if (validRows.length === 0) {
      toast.error("Vui lòng thêm ít nhất một chi tiết nhập hàng hợp lệ");
      return false;
    }

    const invalidRow = formData.chiTiet.find(
      (item) => item.maBienThe <= 0 || item.soLuong <= 0 || item.donGia <= 0,
    );
    if (invalidRow) {
      toast.error(
        "Số lượng và đơn giá phải lớn hơn 0. Vui lòng kiểm tra lại thông tin chi tiết nhập hàng.",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Tạo phiếu nhập hàng thành công");
        onSuccess();
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          "Có lỗi xảy ra khi tạo phiếu nhập hàng";
        toast.error(message);
      },
    });
  };

  const submitDisabled =
    createMutation.status === "pending" ||
    (isAdmin && (isCuaHangsLoading || cuaHangs.length === 0)) ||
    (!isAdmin && !userStoreId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Tạo phiếu nhập hàng mới
            </h2>
            <p className="text-sm text-gray-500">
              Điền thông tin phiếu nhập và chi tiết biến thể.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Cửa hàng
              </label>
              {isAdmin ? (
                <select
                  name="maCh"
                  value={formData.maCh}
                  onChange={handleInputChange}
                  disabled={isCuaHangsLoading}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={0}>Chọn cửa hàng...</option>
                  {cuaHangs.map((ch) => (
                    <option key={ch.maCh} value={ch.maCh}>
                      {ch.tenCh}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
                  {getStoreLabel()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Nhà cung cấp
              </label>
              <select
                name="maNcc"
                value={formData.maNcc ?? ""}
                onChange={handleInputChange}
                disabled={isNhaCungCapsLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Chọn nhà cung cấp...</option>
                {nhaCungCaps.map((ncc) => (
                  <option key={ncc.maNcc} value={ncc.maNcc}>
                    {ncc.tenNcc}
                  </option>
                ))}
              </select>
              {isNhaCungCapsLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Đang tải danh sách nhà cung cấp...
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ghi chú
              </label>
              <textarea
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none"
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Chi tiết phiếu nhập
                </h3>
                <p className="text-sm text-gray-500">
                  Thêm biến thể, số lượng và đơn giá.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <FiPlus /> Thêm dòng
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {formData.chiTiet.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-4 border border-gray-200 rounded-xl"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Biến thể
                    </label>
                    <select
                      value={item.maBienThe}
                      onChange={(e) =>
                        handleChiTietChange(index, "maBienThe", e.target.value)
                      }
                      disabled={isTonKhoLoading || bienTheOptions.length === 0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    >
                      <option value={0}>
                        {isTonKhoLoading
                          ? "Đang tải biến thể..."
                          : selectedStoreId
                            ? "Chọn biến thể..."
                            : "Chọn cửa hàng trước"}
                      </option>
                      {bienTheOptions.map((variant) => (
                        <option
                          key={variant.maBienThe}
                          value={variant.maBienThe}
                        >
                          {variant.sku} - {variant.tenSp}{" "}
                          {variant.mauSac ? `| ${variant.mauSac}` : ""}{" "}
                          {variant.dungLuong ? `| ${variant.dungLuong}` : ""}
                        </option>
                      ))}
                    </select>
                    {!selectedStoreId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Vui lòng chọn cửa hàng trước khi chọn biến thể.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={item.soLuong || ""}
                      onChange={(e) =>
                        handleChiTietChange(index, "soLuong", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      placeholder="Số lượng"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Đơn giá
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={1000}
                      value={item.donGia || ""}
                      onChange={(e) =>
                        handleChiTietChange(index, "donGia", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      placeholder="Đơn giá"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                    aria-label="Xóa dòng"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {createMutation.status === "pending"
                ? "Đang tạo..."
                : "Tạo phiếu nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
