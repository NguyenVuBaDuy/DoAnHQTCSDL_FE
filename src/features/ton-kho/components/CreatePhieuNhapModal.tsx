import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { sanPhamService } from "../../../services/sanPhamService";
import type { CuaHang } from "../../../types/cua-hang";
import type { NhaCungCap } from "../../../types/nha-cung-cap";
import type { CreatePhieuNhapRequest } from "../../../types/phieu-nhap";
import type { SanPhamVariant } from "../../../types/san-pham";
import { useGetNhaCungCaps } from "../hooks/useNhaCungCap";
import { useCreatePhieuNhap } from "../hooks/usePhieuNhap";
import { ProductSelect } from "./ProductSelect";

interface CreatePhieuNhapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: string;
  userStoreId?: number;
  cuaHangs: CuaHang[];
  isCuaHangsLoading: boolean;
}

interface RowState {
  maSp?: number;
  maBienThe: number;
  soLuong: number;
  donGia: number;
  variants: SanPhamVariant[];
  isLoadingVariants: boolean;
}

const initialRow: RowState = {
  maSp: undefined,
  maBienThe: 0,
  soLuong: 1,
  donGia: 0,
  variants: [],
  isLoadingVariants: false,
};

const initialFormData: CreatePhieuNhapRequest = {
  maCh: 0,
  maNcc: undefined,
  ghiChu: "",
  chiTiet: [],
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
  const [rows, setRows] = useState<RowState[]>([{ ...initialRow }]);

  const selectedStoreId = formData.maCh || undefined;

  useEffect(() => {
    if (!isOpen) return;
    const activeCuaHangs = cuaHangs.filter((ch) => ch.trangThai === "HoatDong");
    setFormData({
      maCh:
        !isAdmin && userStoreId
          ? userStoreId
          : activeCuaHangs.length > 0
            ? activeCuaHangs[0].maCh
            : 0,
      maNcc: nhaCungCaps.length > 0 ? nhaCungCaps[0].maNcc : undefined,
      ghiChu: "",
      chiTiet: [],
    });
    setRows([{ ...initialRow }]);
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

  const handleRowChange = (
    index: number,
    field: keyof RowState,
    value: any,
  ) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const handleProductSelect = async (index: number, maSp?: number) => {
    if (!maSp) {
      setRows((prev) =>
        prev.map((row, idx) =>
          idx === index
            ? {
                ...row,
                maSp: undefined,
                maBienThe: 0,
                variants: [],
                isLoadingVariants: false,
              }
            : row,
        ),
      );
      return;
    }

    setRows((prev) =>
      prev.map((row, idx) =>
        idx === index
          ? {
              ...row,
              maSp,
              maBienThe: 0,
              variants: [],
              isLoadingVariants: true,
            }
          : row,
      ),
    );

    try {
      const res = await sanPhamService.getSanPhamDetail(maSp);
      if (res?.success && res.data) {
        const variants = res.data.variants || [];
        setRows((prev) =>
          prev.map((row, idx) =>
            idx === index
              ? {
                  ...row,
                  variants,
                  isLoadingVariants: false,
                }
              : row,
          ),
        );
      } else {
        toast.error("Không thể lấy chi tiết sản phẩm");
        setRows((prev) =>
          prev.map((row, idx) =>
            idx === index
              ? {
                  ...row,
                  isLoadingVariants: false,
                }
              : row,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      toast.error("Lỗi khi tải biến thể sản phẩm");
      setRows((prev) =>
        prev.map((row, idx) =>
          idx === index
            ? {
                ...row,
                isLoadingVariants: false,
              }
            : row,
        ),
      );
    }
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { ...initialRow }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateForm = () => {
    if (!formData.maCh || formData.maCh <= 0) {
      toast.error("Vui lòng chọn cửa hàng");
      return false;
    }

    const validRows = rows.filter(
      (item) =>
        (item.maSp ?? 0) > 0 &&
        item.maBienThe > 0 &&
        item.soLuong > 0 &&
        item.donGia > 0,
    );

    if (validRows.length === 0) {
      toast.error("Vui lòng thêm ít nhất một chi tiết nhập hàng hợp lệ");
      return false;
    }

    const invalidRow = rows.find(
      (item) =>
        !(item.maSp && item.maSp > 0) ||
        item.maBienThe <= 0 ||
        item.soLuong <= 0 ||
        item.donGia <= 0,
    );
    if (invalidRow) {
      if (!invalidRow.maSp || invalidRow.maSp <= 0) {
        toast.error("Vui lòng chọn sản phẩm cho tất cả các dòng");
      } else if (invalidRow.maBienThe <= 0) {
        toast.error("Vui lòng chọn biến thể cho tất cả các dòng");
      } else {
        toast.error(
          "Số lượng và đơn giá phải lớn hơn 0. Vui lòng kiểm tra lại thông tin chi tiết nhập hàng.",
        );
      }
      return false;
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: CreatePhieuNhapRequest = {
      maCh: formData.maCh,
      maNcc: formData.maNcc,
      ghiChu: formData.ghiChu,
      chiTiet: rows.map((row) => ({
        maBienThe: row.maBienThe,
        soLuong: row.soLuong,
        donGia: row.donGia,
      })),
    };

    createMutation.mutate(payload, {
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
              Điền thông tin phiếu nhập và chi tiết sản phẩm.
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
                  {cuaHangs
                    .filter((ch) => ch.trangThai === "HoatDong")
                    .map((ch) => (
                      <option key={ch.maCh} value={ch.maCh}>
                        {ch.tenCh}
                      </option>
                    ))}
                </select>
              ) : (
                (() => {
                  const currentStore = cuaHangs.find((ch) => ch.maCh === userStoreId);
                  if (currentStore) {
                    return (
                      <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 space-y-1.5 shadow-sm">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          {currentStore.tenCh} <span className="text-gray-400 font-normal">(Mã: #{currentStore.maCh})</span>
                        </div>
                        {currentStore.diaChi && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium text-gray-600">Địa chỉ:</span> {currentStore.diaChi}
                          </div>
                        )}
                        {currentStore.sdt && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium text-gray-600">Số điện thoại:</span> {currentStore.sdt}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
                      {getStoreLabel()}
                    </div>
                  );
                })()
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
                  Chọn sản phẩm, sau đó chọn biến thể, số lượng và đơn giá.
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
              {rows.map((item, index) => (
                <div
                  key={index}
                  className="relative p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    aria-label="Xóa dòng"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-sm font-medium text-gray-700">
                        Sản phẩm
                      </label>
                      <ProductSelect
                        selectedId={item.maSp}
                        onChange={(id) => handleProductSelect(index, id)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Biến thể
                      </label>
                      <select
                        value={item.maBienThe}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "maBienThe",
                            Number(e.target.value),
                          )
                        }
                        disabled={
                          item.isLoadingVariants ||
                          !selectedStoreId ||
                          !item.maSp ||
                          item.variants.length === 0
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <option value={0}>
                          {!selectedStoreId
                            ? "Chọn cửa hàng trước"
                            : item.isLoadingVariants
                              ? "Đang tải biến thể..."
                              : !item.maSp
                                ? "Chọn sản phẩm trước"
                                : item.variants.length === 0
                                  ? "Không có biến thể"
                                  : "Chọn biến thể..."}
                        </option>
                        {item.variants.map((variant) => (
                          <option
                            key={variant.maBienThe}
                            value={variant.maBienThe}
                          >
                            {variant.sku} {variant.mauSac ? `| ${variant.mauSac}` : ""}{" "}
                            {variant.dungLuong ? `| ${variant.dungLuong}` : ""}
                          </option>
                        ))}
                      </select>
                      {!selectedStoreId && (
                        <p className="text-xs text-red-500 mt-0.5">
                          Vui lòng chọn cửa hàng trước.
                        </p>
                      )}
                      {selectedStoreId && !item.maSp && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Vui lòng chọn sản phẩm trước.
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
                          handleRowChange(index, "soLuong", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="Số lượng"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Đơn giá (VND)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={1000}
                        value={item.donGia || ""}
                        onChange={(e) =>
                          handleRowChange(index, "donGia", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="Đơn giá"
                      />
                    </div>
                  </div>
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
