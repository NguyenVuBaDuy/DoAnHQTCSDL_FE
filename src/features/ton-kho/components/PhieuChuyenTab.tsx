import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiLoader,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiFileText,
  FiPlusCircle,
  FiTruck,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../../store";
import { cuaHangService } from "../../../services/cuaHangService";
import { tonKhoService } from "../../../services/tonKhoService";
import { phieuChuyenKhoService } from "../../../services/phieuChuyenKhoService";
import { sanPhamService } from "../../../services/sanPhamService";
import { ProductSelect } from "./ProductSelect";
import type { CuaHang } from "../../../types/cua-hang";
import type { TonKhoCuaHang } from "../../../types/ton-kho";
import type { SanPhamVariant } from "../../../types/san-pham";
import type { ApiResponse, PageResponse } from "../../../types/api";
import type {
  PhieuChuyenKhoResponse,
  ChiTietChuyenKhoResponse,
  ChiTietChuyenKhoRequest,
} from "../../../types/phieu-chuyen-kho";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const PhieuChuyenTab = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom;
  const myStoreId = user?.nhanvien?.mach ?? (user as any)?.mach;


  const isAdmin = role === "Admin";

  // List Page State
  const [currentPage, setCurrentPage] = useState(0); // 0-based in UI
  const [selectedPck, setSelectedPck] = useState<PhieuChuyenKhoResponse | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  interface TransferRowState {
    maSp?: number;
    maBienThe: number;
    soLuong: number;
    variants: SanPhamVariant[];
    isLoadingVariants: boolean;
  }

  const initialRow: TransferRowState = {
    maSp: undefined,
    maBienThe: 0,
    soLuong: 1,
    variants: [],
    isLoadingVariants: false,
  };

  // Form State
  const [transferType, setTransferType] = useState<"send" | "receive">("send"); // for staff/managers
  const [sourceStoreId, setSourceStoreId] = useState<number | "">("");
  const [destStoreId, setDestStoreId] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<TransferRowState[]>([{ ...initialRow }]);

  // Clear selected items if the source store changes to prevent invalid transfers
  useEffect(() => {
    if (
      rows.length > 0 &&
      (rows.length > 1 || rows[0].maSp || rows[0].maBienThe)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRows([{ ...initialRow }]);
      toast.success(
        "Đã làm mới danh sách hàng chờ chuyển do thay đổi kho nguồn.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceStoreId]);

  // ==================== Queries ====================

  // 1. Fetch Transfers list
  const {
    data: transfersResponse,
    isLoading: isTransfersLoading,
    isError: isTransfersError,
  } = useQuery<ApiResponse<PageResponse<PhieuChuyenKhoResponse>>, Error>({
    queryKey: ["phieu-chuyen-kho-list", currentPage],
    queryFn: () =>
      phieuChuyenKhoService.getAll({ page: currentPage + 1, size: 10 }),
    placeholderData: (prev) => prev,
  });

  // 2. Fetch Stores list
  const { data: storesResponse } = useQuery<ApiResponse<CuaHang[]>, Error>({
    queryKey: ["cua-hang-list-pck"],
    queryFn: () => cuaHangService.getCuaHangs(),
    enabled: isCreateOpen, // Only fetch when form is open
  });

  // Fetch Source Store Inventory in full (size: 1000) to know their stock quantities
  const { data: sourceStoreInventoryResponse } = useQuery<
    ApiResponse<PageResponse<TonKhoCuaHang>>,
    Error
  >({
    queryKey: ["source-store-inventory", sourceStoreId],
    queryFn: () =>
      tonKhoService.getTonKhoCuaHang(Number(sourceStoreId), {
        page: 0,
        size: 1000,
      }),
    enabled: isCreateOpen && !!sourceStoreId,
  });

  const sourceStoreStockMap = useMemo(() => {
    const map = new Map<number, number>();
    if (sourceStoreInventoryResponse?.data?.content) {
      sourceStoreInventoryResponse.data.content.forEach((item) => {
        map.set(item.maBienThe, item.soLuong);
      });
    }
    return map;
  }, [sourceStoreInventoryResponse]);

  // Public variants query removed as we now load per-product details on-demand.

  // 4. Fetch Transfer Slip Details when selected
  const { data: pckDetailsResponse, isLoading: isDetailsLoading } = useQuery<
    ApiResponse<ChiTietChuyenKhoResponse[]>,
    Error
  >({
    queryKey: ["phieu-chuyen-kho-details", selectedPck?.maPck],
    queryFn: () => phieuChuyenKhoService.getChiTiet(selectedPck!.maPck),
    enabled: isDetailOpen && selectedPck !== null,
  });

  // ==================== Mutations ====================

  // Create Transfer
  const createMutation = useMutation<ApiResponse<any>, any, any>({
    mutationFn: phieuChuyenKhoService.create,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Tạo phiếu chuyển kho thành công!");
        queryClient.invalidateQueries({ queryKey: ["phieu-chuyen-kho-list"] });
        setIsCreateOpen(false);
        resetForm();
      } else {
        toast.error(res.message || "Tạo phiếu thất bại");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Đã xảy ra lỗi khi kết nối hệ thống.");
    },
  });

  // Approve Transfer
  const approveMutation = useMutation<ApiResponse<any>, any, number>({
    mutationFn: phieuChuyenKhoService.approve,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          "Duyệt phiếu chuyển kho thành công! Số lượng kho đã được cập nhật.",
        );
        queryClient.invalidateQueries({ queryKey: ["phieu-chuyen-kho-list"] });
        if (selectedPck) {
          queryClient.invalidateQueries({
            queryKey: ["phieu-chuyen-kho-details", selectedPck.maPck],
          });
        }
        setIsDetailOpen(false);
      } else {
        toast.error(res.message || "Duyệt phiếu thất bại");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi duyệt phiếu.");
    },
  });

  // Cancel Transfer
  const cancelMutation = useMutation<ApiResponse<any>, any, number>({
    mutationFn: phieuChuyenKhoService.cancel,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã hủy phiếu chuyển kho thành công!");
        queryClient.invalidateQueries({ queryKey: ["phieu-chuyen-kho-list"] });
        if (selectedPck) {
          queryClient.invalidateQueries({
            queryKey: ["phieu-chuyen-kho-details", selectedPck.maPck],
          });
        }
        setIsDetailOpen(false);
      } else {
        toast.error(res.message || "Hủy phiếu thất bại");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi hủy phiếu.");
    },
  });

  // ==================== Helper Functions ====================

  const stores: CuaHang[] = storesResponse?.data || [];
  const transfers: PhieuChuyenKhoResponse[] =
    transfersResponse?.data?.content || [];
  const pageData = transfersResponse?.data;
  const pckDetails: ChiTietChuyenKhoResponse[] = pckDetailsResponse?.data || [];

  // Reset all state for new transfer form
  const resetForm = () => {
    setTransferType("send");
    setSourceStoreId("");
    setDestStoreId("");
    setNote("");
    setRows([{ ...initialRow }]);
  };

  const handleRowChange = (
    index: number,
    field: keyof TransferRowState,
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
    if (rows.length === 1) {
      setRows([{ ...initialRow }]);
      return;
    }
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Trigger form setup depending on user role
  useEffect(() => {
    if (isCreateOpen) {
      if (!isAdmin && myStoreId) {
        // Staff/manager role: one store is locked to myStoreId
        if (transferType === "send") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSourceStoreId(myStoreId);
          setDestStoreId("");
        } else {
          setSourceStoreId("");
          setDestStoreId(myStoreId);
        }
      } else {
        // Admin role
        setSourceStoreId("");
        setDestStoreId("");
      }
    }
  }, [isCreateOpen, transferType, isAdmin, myStoreId]);

  // Old variant selectors and handlers removed as they are replaced by our robust row-based selection.

  const validateForm = () => {
    if (!sourceStoreId) {
      toast.error("Vui lòng chọn cửa hàng nguồn!");
      return false;
    }
    if (!destStoreId) {
      toast.error("Vui lòng chọn cửa hàng đích!");
      return false;
    }
    if (sourceStoreId === destStoreId) {
      toast.error("Cửa hàng nguồn và cửa hàng đích không được trùng nhau!");
      return false;
    }

    const validRows = rows.filter(
      (item) => (item.maSp ?? 0) > 0 && item.maBienThe > 0 && item.soLuong > 0,
    );

    if (validRows.length === 0) {
      toast.error("Vui lòng thêm ít nhất một chi tiết chuyển kho!");
      return false;
    }

    const invalidRow = rows.find(
      (item) =>
        !(item.maSp && item.maSp > 0) ||
        item.maBienThe <= 0 ||
        item.soLuong <= 0,
    );
    if (invalidRow) {
      if (!invalidRow.maSp || invalidRow.maSp <= 0) {
        toast.error("Vui lòng chọn sản phẩm cho tất cả các dòng!");
      } else if (invalidRow.maBienThe <= 0) {
        toast.error("Vui lòng chọn biến thể cho tất cả các dòng!");
      } else {
        toast.error("Số lượng chuyển phải lớn hơn 0!");
      }
      return false;
    }

    // Validate quantities against source store stock
    for (const item of rows) {
      const stock = sourceStoreStockMap.get(item.maBienThe) || 0;
      if (item.soLuong > stock) {
        const variantName =
          item.variants.find((v) => v.maBienThe === item.maBienThe)?.sku ||
          `Mã #${item.maBienThe}`;
        toast.error(
          `Sản phẩm "${variantName}" vượt quá số lượng tồn tại kho nguồn (${stock})!`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const chiTiet: ChiTietChuyenKhoRequest[] = rows.map((row) => ({
      maBienThe: row.maBienThe,
      soLuong: row.soLuong,
    }));

    createMutation.mutate({
      maChNguon: Number(sourceStoreId),
      maChDich: Number(destStoreId),
      ghiChu: note,
      chiTiet,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ChoDuyet":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ duyệt
          </span>
        );
      case "DaChuyenKho":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đã chuyển kho
          </span>
        );
      case "HuyPhieu":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  if (role === "NhanVienBan") {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full min-h-0">
      {/* Top Banner and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiLoader className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Phiếu chờ duyệt
            </p>
            <p className="text-2xl font-extrabold text-gray-800 mt-0.5">
              {transfers.filter((t) => t.trangThai === "ChoDuyet").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Đã hoàn thành
            </p>
            <p className="text-2xl font-extrabold text-gray-800 mt-0.5">
              {transfers.filter((t) => t.trangThai === "DaChuyenKho").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 hover:scale-102 font-semibold text-sm transition-all duration-200 group"
          >
            <FiPlus className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-90" />
            Tạo phiếu chuyển kho mới
          </button>
        </div>
      </div>

      {/* Main List Table Area */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50/70 border-b border-gray-200 uppercase sticky top-0 z-10 backdrop-blur-xs font-bold">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Mã phiếu</th>
                <th className="px-6 py-4 font-bold tracking-wider">
                  Kho nguồn (Gửi)
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  <FiArrowRight className="inline text-gray-400" />
                </th>
                <th className="px-6 py-4 font-bold tracking-wider">
                  Kho đích (Nhận)
                </th>
                <th className="px-6 py-4 font-bold tracking-wider">
                  Người lập
                </th>
                <th className="px-6 py-4 font-bold tracking-wider">
                  Ngày chuyển
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isTransfersLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <FiLoader className="animate-spin text-3xl text-blue-600 mx-auto" />
                    <div className="text-sm font-medium text-gray-500 mt-2">
                      Đang tải danh sách phiếu chuyển...
                    </div>
                  </td>
                </tr>
              ) : isTransfersError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-rose-500 font-medium bg-rose-50/50"
                  >
                    Đã xảy ra lỗi khi tải danh sách phiếu chuyển kho! Vui lòng
                    thử lại sau.
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-bold text-gray-800">
                      Không tìm thấy phiếu chuyển nào
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Hãy nhấn "Tạo phiếu chuyển kho mới" để bắt đầu luân chuyển
                      hàng hóa.
                    </p>
                  </td>
                </tr>
              ) : (
                transfers.map((item) => (
                  <tr
                    key={item.maPck}
                    className="hover:bg-blue-50/20 transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      setSelectedPck(item);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 font-bold text-blue-600">
                      #{item.maPck}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.tenChNguon}
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-normal">
                        Mã CH: #{item.maChNguon}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="p-1.5 bg-gray-100 text-gray-500 rounded-full inline-block">
                        <FiTruck size={14} />
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.tenChDich}
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-normal">
                        Mã CH: #{item.maChDich}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {item.tenNv || "Hệ thống"}
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">
                        {item.maNv}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {formatDateTime(item.ngayChuyenKho)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {getStatusBadge(item.trangThai)}
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setSelectedPck(item);
                          setIsDetailOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg shadow-2xs transition-all"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isTransfersLoading && pageData && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0 bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Hiển thị{" "}
              {pageData.totalElements === 0
                ? 0
                : currentPage * pageData.size + 1}{" "}
              đến{" "}
              {Math.min(
                (currentPage + 1) * pageData.size,
                pageData.totalElements,
              )}{" "}
              trong số {pageData.totalElements} phiếu
            </span>
            <div className="flex gap-1">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50 disabled:pointer-events-none"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Trước
              </button>

              {Array.from({
                length: Math.ceil(pageData.totalElements / pageData.size),
              }).map((_, idx) => {
                const totalPages = Math.ceil(
                  pageData.totalElements / pageData.size,
                );
                if (
                  idx === 0 ||
                  idx === totalPages - 1 ||
                  Math.abs(idx - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentPage === idx
                          ? "bg-blue-600 text-white shadow-xs border border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 border border-gray-300 bg-white shadow-2xs"
                      }`}
                      onClick={() => setCurrentPage(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                } else if (Math.abs(idx - currentPage) === 2) {
                  return (
                    <span
                      key={idx}
                      className="px-2 py-1 text-gray-400 font-bold self-center"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50 disabled:pointer-events-none"
                disabled={
                  currentPage >=
                  Math.ceil(pageData.totalElements / pageData.size) - 1
                }
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CREATE MODAL ==================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-100 transform scale-100 transition-all duration-300 overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FiPlusCircle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Tạo Phiếu Chuyển Kho Mới
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lập phiếu luân chuyển hàng hóa giữa các kho chi nhánh trong
                    hệ thống
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 p-6 space-y-6"
            >
              {/* Step 1: Role-based Store Configuration */}
              <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <FiMapPin className="text-blue-500" />
                  Cài đặt kho nguồn & kho đích
                </h3>

                {!isAdmin ? (
                  /* Employee / Manager view: Locked to their own store. Choose Transfer direction */
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Hướng chuyển hàng
                      </label>
                      <select
                        value={transferType}
                        onChange={(e) =>
                          setTransferType(e.target.value as "send" | "receive")
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-gray-800 shadow-2xs"
                      >
                        <option value="send">
                          Chuyển hàng đi (Từ cửa hàng của tôi)
                        </option>
                        <option value="receive">
                          Nhận hàng về (Về cửa hàng của tôi)
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Cửa hàng nguồn (Từ)
                        </label>
                        {transferType === "send" ? (
                          (() => {
                            const myStore = stores.find(
                              (st) => st.maCh === myStoreId,
                            );
                            if (myStore) {
                              return (
                                <div className="px-3 py-2 border border-gray-200 bg-gray-50 text-sm text-gray-700 rounded-lg space-y-1 shadow-xs">
                                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                    {myStore.tenCh}{" "}
                                    <span className="text-gray-400 font-normal text-xs">
                                      (Mã: #{myStore.maCh})
                                    </span>
                                  </div>
                                  {myStore.diaChi && (
                                    <p className="text-[10px] text-gray-500 leading-normal">
                                      <span className="font-medium text-gray-600">
                                        Địa chỉ:
                                      </span>{" "}
                                      {myStore.diaChi}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div className="px-3 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold">
                                Cửa hàng của tôi (Mã: #{myStoreId})
                              </div>
                            );
                          })()
                        ) : (
                          <select
                            value={sourceStoreId}
                            onChange={(e) =>
                              setSourceStoreId(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                            required
                          >
                            <option value="">-- Chọn cửa hàng nguồn --</option>
                            {stores
                              .filter(
                                (st) =>
                                  st.maCh !== myStoreId &&
                                  st.trangThai === "HoatDong",
                              )
                              .map((st) => (
                                <option key={st.maCh} value={st.maCh}>
                                  {st.tenCh} (Mã: #{st.maCh})
                                </option>
                              ))}
                          </select>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Cửa hàng đích (Đến)
                        </label>
                        {transferType === "receive" ? (
                          (() => {
                            const myStore = stores.find(
                              (st) => st.maCh === myStoreId,
                            );
                            if (myStore) {
                              return (
                                <div className="px-3 py-2 border border-gray-200 bg-gray-50 text-sm text-gray-700 rounded-lg space-y-1 shadow-xs">
                                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                    {myStore.tenCh}{" "}
                                    <span className="text-gray-400 font-normal text-xs">
                                      (Mã: #{myStore.maCh})
                                    </span>
                                  </div>
                                  {myStore.diaChi && (
                                    <p className="text-[10px] text-gray-500 leading-normal">
                                      <span className="font-medium text-gray-600">
                                        Địa chỉ:
                                      </span>{" "}
                                      {myStore.diaChi}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div className="px-3 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold">
                                Cửa hàng của tôi (Mã: #{myStoreId})
                              </div>
                            );
                          })()
                        ) : (
                          <select
                            value={destStoreId}
                            onChange={(e) =>
                              setDestStoreId(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                            required
                          >
                            <option value="">-- Chọn cửa hàng đích --</option>
                            {stores
                              .filter(
                                (st) =>
                                  st.maCh !== myStoreId &&
                                  st.trangThai === "HoatDong",
                              )
                              .map((st) => (
                                <option key={st.maCh} value={st.maCh}>
                                  {st.tenCh} (Mã: #{st.maCh})
                                </option>
                              ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Admin view: Choose both stores freely */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Cửa hàng nguồn (Gửi đi từ)
                      </label>
                      <select
                        value={sourceStoreId}
                        onChange={(e) =>
                          setSourceStoreId(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                        required
                      >
                        <option value="">-- Chọn cửa hàng nguồn --</option>
                        {stores
                          .filter(
                            (st) =>
                              st.trangThai === "HoatDong" &&
                              st.maCh !== destStoreId,
                          )
                          .map((st) => (
                            <option key={st.maCh} value={st.maCh}>
                              {st.tenCh} (Mã: #{st.maCh})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Cửa hàng đích (Nhận về tại)
                      </label>
                      <select
                        value={destStoreId}
                        onChange={(e) => setDestStoreId(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                        required
                      >
                        <option value="">-- Chọn cửa hàng đích --</option>
                        {stores
                          .filter(
                            (st) =>
                              st.trangThai === "HoatDong" &&
                              st.maCh !== sourceStoreId,
                          )
                          .map((st) => (
                            <option key={st.maCh} value={st.maCh}>
                              {st.tenCh} (Mã: #{st.maCh})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 & 3: Product Variants & Selection in 2x2 grid card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Danh sách sản phẩm chuyển đi
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FiPlus size={14} />
                    Thêm dòng
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {rows.map((item, index) => {
                    const stock = item.maBienThe
                      ? sourceStoreStockMap.get(item.maBienThe) || 0
                      : 0;

                    return (
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
                              onChange={(e) => {
                                const maBt = Number(e.target.value);
                                handleRowChange(index, "maBienThe", maBt);
                                handleRowChange(index, "soLuong", 1);
                              }}
                              disabled={
                                item.isLoadingVariants ||
                                !sourceStoreId ||
                                !item.maSp ||
                                item.variants.length === 0
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
                            >
                              <option value={0}>
                                {!sourceStoreId
                                  ? "Chọn cửa hàng nguồn trước"
                                  : item.isLoadingVariants
                                    ? "Đang tải biến thể..."
                                    : !item.maSp
                                      ? "Chọn sản phẩm trước"
                                      : item.variants.length === 0
                                        ? "Không có biến thể"
                                        : "Chọn biến thể..."}
                              </option>
                              {item.variants.map((variant) => {
                                const variantStock =
                                  sourceStoreStockMap.get(variant.maBienThe) ||
                                  0;
                                return (
                                  <option
                                    key={variant.maBienThe}
                                    value={variant.maBienThe}
                                  >
                                    {variant.sku}{" "}
                                    {variant.mauSac
                                      ? `| ${variant.mauSac}`
                                      : ""}{" "}
                                    {variant.dungLuong
                                      ? `| ${variant.dungLuong}`
                                      : ""}{" "}
                                    (
                                    {variantStock > 0
                                      ? `Tồn: ${variantStock}`
                                      : "Hết hàng"}
                                    )
                                  </option>
                                );
                              })}
                            </select>
                            {!sourceStoreId && (
                              <p className="text-xs text-red-500 mt-0.5">
                                Vui lòng chọn cửa hàng nguồn trước.
                              </p>
                            )}
                            {sourceStoreId && !item.maSp && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Vui lòng chọn sản phẩm trước.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-700">
                                Số lượng chuyển
                              </label>
                              {item.maBienThe > 0 && (
                                <span className="text-xs font-semibold text-emerald-600">
                                  Khả dụng: {stock} sản phẩm
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={stock || 1}
                              step={1}
                              value={item.soLuong || ""}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > stock) {
                                  toast.error(
                                    `Số lượng chuyển không vượt quá tồn kho nguồn (${stock})!`,
                                  );
                                  handleRowChange(index, "soLuong", stock);
                                } else {
                                  handleRowChange(index, "soLuong", val);
                                }
                              }}
                              disabled={!item.maBienThe}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
                              placeholder="Số lượng"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Notes field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Ghi chú phiếu chuyển kho
                </label>
                <textarea
                  placeholder="Nhập thông tin lý do chuyển kho, mã vận đơn hoặc ghi chú liên quan..."
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <FiLoader className="animate-spin" />
                      <span>Đang lập phiếu...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      <span>Tạo phiếu chuyển</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DETAILS MODAL ==================== */}
      {isDetailOpen && selectedPck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 transform scale-100 transition-all duration-300 overflow-hidden my-8 animate-scale-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-gray-50 to-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FiTruck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Chi Tiết Phiếu Chuyển Kho #{selectedPck.maPck}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Quản lý và cập nhật thông tin luân chuyển hàng hóa thực tế
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedPck(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Slip Metadata and Route Map */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Source -> Dest Visual Card */}
                <div className="md:col-span-2 bg-linear-to-br from-indigo-50/50 via-blue-50/20 to-transparent p-5 rounded-2xl border border-indigo-100/50 flex items-center justify-between gap-4 shadow-2xs">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                      KHO NGUỒN (GỬI)
                    </span>
                    <h4 className="font-extrabold text-gray-800 text-sm">
                      {selectedPck.tenChNguon}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">
                      Mã CH: #{selectedPck.maChNguon}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 shrink-0 px-2">
                    <span className="p-2 bg-white text-indigo-600 rounded-full shadow-md">
                      <FiTruck className="w-5 h-5 animate-bounce-subtle" />
                    </span>
                    <FiArrowRight className="text-indigo-400" />
                  </div>

                  <div className="flex-1 text-right">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                      KHO ĐÍCH (NHẬN)
                    </span>
                    <h4 className="font-extrabold text-gray-800 text-sm">
                      {selectedPck.tenChDich}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">
                      Mã CH: #{selectedPck.maChDich}
                    </span>
                  </div>
                </div>

                {/* Status and Info Block */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                      Trạng thái phiếu
                    </span>
                    <div className="mt-1.5">
                      {getStatusBadge(selectedPck.trangThai)}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="shrink-0 text-gray-400" />
                      <span>
                        Ngày:{" "}
                        <strong className="text-gray-700">
                          {formatDateTime(selectedPck.ngayChuyenKho)}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUser className="shrink-0 text-gray-400" />
                      <span>
                        Lập bởi:{" "}
                        <strong className="text-gray-700">
                          {selectedPck.tenNv || "Hệ thống"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                  <FiFileText className="text-indigo-500" />
                  Danh sách sản phẩm chi tiết ({pckDetails.length})
                </h4>

                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3">Mã Biến thể</th>
                        <th className="px-6 py-3">Tên sản phẩm</th>
                        <th className="px-6 py-3">SKU</th>
                        <th className="px-6 py-3">Thuộc tính</th>
                        <th className="px-6 py-3 text-center">
                          Số lượng chuyển
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                      {isDetailsLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <FiLoader className="animate-spin text-2xl text-blue-600 mx-auto" />
                            <p className="text-xs text-gray-400 mt-2">
                              Đang tải sản phẩm chi tiết...
                            </p>
                          </td>
                        </tr>
                      ) : pckDetails.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-gray-400"
                          >
                            Không có sản phẩm nào trong chi tiết phiếu chuyển.
                          </td>
                        </tr>
                      ) : (
                        pckDetails.map((dt) => (
                          <tr
                            key={dt.maBienThe}
                            className="hover:bg-gray-50/30"
                          >
                            <td className="px-6 py-4 font-bold text-gray-500 text-xs">
                              #{dt.maBienThe}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {dt.tenSp}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">
                              {dt.sku}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              <div className="flex gap-2">
                                {dt.mauSac && (
                                  <span>
                                    Màu: <strong>{dt.mauSac}</strong>
                                  </span>
                                )}
                                {dt.dungLuong && (
                                  <span>
                                    | Dung lượng:{" "}
                                    <strong>{dt.dungLuong}</strong>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-extrabold text-blue-600 text-base">
                              {dt.soLuong}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note view */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Ghi chú phiếu chuyển
                </span>
                <p className="text-sm text-gray-700 mt-1 font-medium italic">
                  {selectedPck.ghiChu || "Không có ghi chú nào đi kèm."}
                </p>
              </div>
            </div>

            {/* Modal Footer & Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 justify-between items-center bg-gray-50 shrink-0">
              {/* Message alerts */}
              <div className="text-xs text-gray-500 font-medium">
                {selectedPck.trangThai === "ChoDuyet" && (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <FiAlertCircle />
                    {role === "NhanVienKho"
                      ? "Phiếu này đang chờ được Quản lý cửa hàng hoặc Admin duyệt."
                      : "Phiếu này đang chờ được duyệt để thực hiện cập nhật kho hàng."}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setSelectedPck(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
                >
                  Đóng
                </button>

                {selectedPck.trangThai === "ChoDuyet" && (
                  <>
                    <button
                      onClick={() => cancelMutation.mutate(selectedPck.maPck)}
                      disabled={cancelMutation.isPending}
                      className="px-4 py-2 text-sm font-semibold text-rose-600 hover:text-white bg-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl shadow-sm hover:shadow-rose-500/10 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {cancelMutation.isPending ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <>
                          <FiX />
                          <span>Hủy phiếu</span>
                        </>
                      )}
                    </button>

                    {role !== "NhanVienKho" && (
                      <button
                        onClick={() => approveMutation.mutate(selectedPck.maPck)}
                        disabled={approveMutation.isPending}
                        className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {approveMutation.isPending ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <>
                            <FiCheck />
                            <span>Duyệt chuyển kho</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
