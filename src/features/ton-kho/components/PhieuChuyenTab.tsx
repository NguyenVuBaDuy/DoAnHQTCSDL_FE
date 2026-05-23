import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiSearch,
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
import type { CuaHang } from "../../../types/cua-hang";
import type { TonKhoCuaHang } from "../../../types/ton-kho";
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
  const myStoreId = user?.nhanvien?.mach;

  const isAdmin = role === "Admin";

  // List Page State
  const [currentPage, setCurrentPage] = useState(0); // 0-based in UI
  const [selectedPck, setSelectedPck] = useState<PhieuChuyenKhoResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [transferType, setTransferType] = useState<"send" | "receive">("send"); // for staff/managers
  const [sourceStoreId, setSourceStoreId] = useState<number | "">("");
  const [destStoreId, setDestStoreId] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      variant: TonKhoCuaHang;
      soLuong: number;
    }>
  >([]);

  // Variant Search inside Form
  const [variantSearch, setVariantSearch] = useState("");
  const [debouncedVariantSearch, setDebouncedVariantSearch] = useState("");
  const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false);
  const variantSearchRef = useRef<HTMLDivElement>(null);

  // Close variant dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        variantSearchRef.current &&
        !variantSearchRef.current.contains(e.target as Node)
      ) {
        setIsVariantDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounce variant search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVariantSearch(variantSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [variantSearch]);

  // Clear selected items if the source store changes to prevent invalid transfers
  useEffect(() => {
    if (selectedItems.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItems([]);
      toast.success("Đã làm mới danh sách hàng chờ chuyển do thay đổi kho nguồn.");
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
    queryFn: () => phieuChuyenKhoService.getAll({ page: currentPage + 1, size: 10 }),
    placeholderData: (prev) => prev,
  });

  // 2. Fetch Stores list
  const { data: storesResponse } = useQuery<ApiResponse<CuaHang[]>, Error>({
    queryKey: ["cua-hang-list-pck"],
    queryFn: () => cuaHangService.getCuaHangs(),
    enabled: isCreateOpen, // Only fetch when form is open
  });

  // 3. Fetch Product Variants from the selected SOURCE store
  const { data: variantsResponse, isLoading: isVariantsLoading } = useQuery<
    ApiResponse<PageResponse<TonKhoCuaHang>>,
    Error
  >({
    queryKey: ["variants-search-pck", sourceStoreId, debouncedVariantSearch],
    queryFn: () =>
      tonKhoService.getTonKhoCuaHang(Number(sourceStoreId), {
        search: debouncedVariantSearch,
        page: 0,
        size: 50,
      }),
    enabled: isCreateOpen && isVariantDropdownOpen && !!sourceStoreId,
  });

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
        toast.success("Duyệt phiếu chuyển kho thành công! Số lượng kho đã được cập nhật.");
        queryClient.invalidateQueries({ queryKey: ["phieu-chuyen-kho-list"] });
        if (selectedPck) {
          queryClient.invalidateQueries({ queryKey: ["phieu-chuyen-kho-details", selectedPck.maPck] });
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
          queryClient.invalidateQueries({ queryKey: ["phieu-chuyen-kho-details", selectedPck.maPck] });
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
  const variants: TonKhoCuaHang[] = variantsResponse?.data?.content || [];
  const transfers: PhieuChuyenKhoResponse[] = transfersResponse?.data?.content || [];
  const pageData = transfersResponse?.data;
  const pckDetails: ChiTietChuyenKhoResponse[] = pckDetailsResponse?.data || [];

  // Reset all state for new transfer form
  const resetForm = () => {
    setTransferType("send");
    setSourceStoreId("");
    setDestStoreId("");
    setNote("");
    setSelectedItems([]);
    setVariantSearch("");
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

  const handleAddVariant = (v: TonKhoCuaHang) => {
    // Check if already added
    if (selectedItems.some((item) => item.variant.maBienThe === v.maBienThe)) {
      toast.error("Biến thể này đã được thêm vào danh sách!");
      return;
    }
    // Check if store has stock
    if (v.soLuong <= 0) {
      toast.error("Biến thể này đã hết hàng ở cửa hàng nguồn!");
      return;
    }

    setSelectedItems((prev) => [...prev, { variant: v, soLuong: 1 }]);
    setVariantSearch("");
    setIsVariantDropdownOpen(false);
  };

  const handleUpdateQty = (maBienThe: number, qty: number, maxQty: number) => {
    if (qty <= 0) return;
    if (qty > maxQty) {
      toast.error(`Số lượng chuyển không vượt quá tồn kho của nguồn (${maxQty})!`);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.variant.maBienThe === maBienThe ? { ...item, soLuong: qty } : item
      )
    );
  };

  const handleRemoveItem = (maBienThe: number) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.variant.maBienThe !== maBienThe)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceStoreId) {
      toast.error("Vui lòng chọn cửa hàng nguồn!");
      return;
    }
    if (!destStoreId) {
      toast.error("Vui lòng chọn cửa hàng đích!");
      return;
    }
    if (sourceStoreId === destStoreId) {
      toast.error("Cửa hàng nguồn và cửa hàng đích không được trùng nhau!");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một biến thể sản phẩm cần chuyển!");
      return;
    }

    // Validate quantities against source store stock
    for (const item of selectedItems) {
      if (item.soLuong > item.variant.soLuong) {
        toast.error(`Sản phẩm "${item.variant.tenSp}" vượt quá số lượng tồn tại kho nguồn (${item.variant.soLuong})!`);
        return;
      }
    }

    const chiTiet: ChiTietChuyenKhoRequest[] = selectedItems.map((item) => ({
      maBienThe: item.variant.maBienThe,
      soLuong: item.soLuong,
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

  return (
    <div className="flex flex-col gap-6 w-full h-full min-h-0">
      {/* Top Banner and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiLoader className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phiếu chờ duyệt</p>
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
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Đã hoàn thành</p>
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
                <th className="px-6 py-4 font-bold tracking-wider">Kho nguồn (Gửi)</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  <FiArrowRight className="inline text-gray-400" />
                </th>
                <th className="px-6 py-4 font-bold tracking-wider">Kho đích (Nhận)</th>
                <th className="px-6 py-4 font-bold tracking-wider">Người lập</th>
                <th className="px-6 py-4 font-bold tracking-wider">Ngày chuyển</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Thao tác</th>
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
                  <td colSpan={8} className="px-6 py-16 text-center text-rose-500 font-medium bg-rose-50/50">
                    Đã xảy ra lỗi khi tải danh sách phiếu chuyển kho! Vui lòng thử lại sau.
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                    <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-bold text-gray-800">Không tìm thấy phiếu chuyển nào</p>
                    <p className="text-xs text-gray-400 mt-1">Hãy nhấn "Tạo phiếu chuyển kho mới" để bắt đầu luân chuyển hàng hóa.</p>
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
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-normal">Mã CH: #{item.maChNguon}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="p-1.5 bg-gray-100 text-gray-500 rounded-full inline-block">
                        <FiTruck size={14} />
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.tenChDich}
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-normal">Mã CH: #{item.maChDich}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {item.tenNv || "Hệ thống"}
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">{item.maNv}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {formatDateTime(item.ngayChuyenKho)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {getStatusBadge(item.trangThai)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
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
              {pageData.totalElements === 0 ? 0 : currentPage * pageData.size + 1}{" "}
              đến {Math.min((currentPage + 1) * pageData.size, pageData.totalElements)}{" "}
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
                const totalPages = Math.ceil(pageData.totalElements / pageData.size);
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
                    <span key={idx} className="px-2 py-1 text-gray-400 font-bold self-center">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50 disabled:pointer-events-none"
                disabled={
                  currentPage >= Math.ceil(pageData.totalElements / pageData.size) - 1
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 transform scale-100 transition-all duration-300 overflow-hidden my-8">
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
                    Lập phiếu luân chuyển hàng hóa giữa các kho chi nhánh trong hệ thống
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
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
              
              {/* Step 1: Role-based Store Configuration */}
              <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <FiMapPin className="text-blue-500" />
                  Cài đặt kho nguồn & kho đích
                </h3>

                {!isAdmin ? (
                  /* Employee / Manager view: Locked to their own store. Choose Transfer direction */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Hướng chuyển hàng
                      </label>
                      <select
                        value={transferType}
                        onChange={(e) => setTransferType(e.target.value as "send" | "receive")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-gray-800 shadow-2xs"
                      >
                        <option value="send">Chuyển hàng đi (Từ cửa hàng của tôi)</option>
                        <option value="receive">Nhận hàng về (Về cửa hàng của tôi)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Cửa hàng nguồn (Từ)
                      </label>
                      {transferType === "send" ? (
                        <div className="px-3 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold">
                          Cửa hàng của tôi (Mặc định)
                        </div>
                      ) : (
                        <select
                          value={sourceStoreId}
                          onChange={(e) => setSourceStoreId(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                          required
                        >
                          <option value="">-- Chọn cửa hàng nguồn --</option>
                          {stores
                            .filter((st) => st.maCh !== myStoreId && st.trangThai === "HoatDong")
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
                        <div className="px-3 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold">
                          Cửa hàng của tôi (Mặc định)
                        </div>
                      ) : (
                        <select
                          value={destStoreId}
                          onChange={(e) => setDestStoreId(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                          required
                        >
                          <option value="">-- Chọn cửa hàng đích --</option>
                          {stores
                            .filter((st) => st.maCh !== myStoreId && st.trangThai === "HoatDong")
                            .map((st) => (
                              <option key={st.maCh} value={st.maCh}>
                                {st.tenCh} (Mã: #{st.maCh})
                              </option>
                            ))}
                        </select>
                      )}
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
                        onChange={(e) => setSourceStoreId(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-2xs"
                        required
                      >
                        <option value="">-- Chọn cửa hàng nguồn --</option>
                        {stores
                          .filter((st) => st.trangThai === "HoatDong" && st.maCh !== destStoreId)
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
                          .filter((st) => st.trangThai === "HoatDong" && st.maCh !== sourceStoreId)
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

              {/* Step 2: Search & Add Product Variants */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between items-center">
                  <span>Tìm & chọn biến thể sản phẩm cần chuyển</span>
                  {!sourceStoreId && (
                    <span className="text-rose-500 normal-case font-semibold text-[11px] animate-pulse">
                      * Vui lòng chọn cửa hàng nguồn trước để hiển thị sản phẩm tương ứng!
                    </span>
                  )}
                </label>

                <div ref={variantSearchRef} className="relative w-full">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={
                        sourceStoreId
                          ? "Tìm biến thể theo tên, SKU, barcode, màu sắc..."
                          : "Vui lòng chọn cửa hàng nguồn phía trên trước..."
                      }
                      disabled={!sourceStoreId}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                      value={variantSearch}
                      onChange={(e) => {
                        setVariantSearch(e.target.value);
                        setIsVariantDropdownOpen(true);
                      }}
                      onFocus={() => setIsVariantDropdownOpen(true)}
                    />
                    {variantSearch && (
                      <button
                        type="button"
                        onClick={() => setVariantSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown variants search result */}
                  {isVariantDropdownOpen && sourceStoreId && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar flex flex-col">
                      {isVariantsLoading ? (
                        <div className="px-4 py-6 text-center text-gray-400 flex items-center justify-center gap-2">
                          <FiLoader className="w-5 h-5 animate-spin text-blue-500" />
                          <span className="text-sm">Đang tải sản phẩm từ kho nguồn...</span>
                        </div>
                      ) : variants.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                          Không tìm thấy biến thể nào trong cửa hàng nguồn.
                        </div>
                      ) : (
                        variants.map((v) => (
                          <div
                            key={v.maBienThe}
                            onClick={() => handleAddVariant(v)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                          >
                            <div className="w-9 h-9 bg-gray-50 rounded border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                              {v.anhSp ? (
                                <img src={v.anhSp} alt={v.tenSp} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-gray-400">Ảnh</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{v.tenSp}</p>
                              <div className="flex gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                                <span>SKU: {v.sku}</span>
                                {v.mauSac && <span>| Màu: {v.mauSac}</span>}
                                {v.dungLuong && <span>| Dung lượng: {v.dungLuong}</span>}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  v.soLuong > 0
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                }`}
                              >
                                Tồn kho: {v.soLuong}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Selected items list table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Danh sách biến thể chuyển đi</h4>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ảnh</th>
                        <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold text-center">Tồn tại kho nguồn</th>
                        <th className="px-4 py-3 font-semibold text-center w-[120px]">Số lượng chuyển</th>
                        <th className="px-4 py-3 font-semibold text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-medium">
                            Chưa chọn sản phẩm nào. Hãy tìm kiếm biến thể phía trên để thêm vào phiếu.
                          </td>
                        </tr>
                      ) : (
                        selectedItems.map((item) => (
                          <tr key={item.variant.maBienThe} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                                {item.variant.anhSp ? (
                                  <img src={item.variant.anhSp} alt={item.variant.tenSp} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] text-gray-400">Ảnh</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">{item.variant.tenSp}</p>
                              <div className="flex gap-2 text-[10px] text-gray-400 mt-0.5">
                                {item.variant.mauSac && <span>Màu: {item.variant.mauSac}</span>}
                                {item.variant.dungLuong && <span>Dung lượng: {item.variant.dungLuong}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-700">
                              {item.variant.sku}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-600">
                              {item.variant.soLuong}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={1}
                                max={item.variant.soLuong}
                                value={item.soLuong}
                                onChange={(e) =>
                                  handleUpdateQty(
                                    item.variant.maBienThe,
                                    Number(e.target.value),
                                    item.variant.soLuong
                                  )
                                }
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-center font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                                required
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.variant.maBienThe)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">KHO NGUỒN (GỬI)</span>
                    <h4 className="font-extrabold text-gray-800 text-sm">{selectedPck.tenChNguon}</h4>
                    <span className="text-xs text-gray-400 font-medium">Mã CH: #{selectedPck.maChNguon}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 shrink-0 px-2">
                    <span className="p-2 bg-white text-indigo-600 rounded-full shadow-md">
                      <FiTruck className="w-5 h-5 animate-bounce-subtle" />
                    </span>
                    <FiArrowRight className="text-indigo-400" />
                  </div>

                  <div className="flex-1 text-right">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">KHO ĐÍCH (NHẬN)</span>
                    <h4 className="font-extrabold text-gray-800 text-sm">{selectedPck.tenChDich}</h4>
                    <span className="text-xs text-gray-400 font-medium">Mã CH: #{selectedPck.maChDich}</span>
                  </div>
                </div>

                {/* Status and Info Block */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Trạng thái phiếu</span>
                    <div className="mt-1.5">{getStatusBadge(selectedPck.trangThai)}</div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="shrink-0 text-gray-400" />
                      <span>Ngày: <strong className="text-gray-700">{formatDateTime(selectedPck.ngayChuyenKho)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUser className="shrink-0 text-gray-400" />
                      <span>Lập bởi: <strong className="text-gray-700">{selectedPck.tenNv || "Hệ thống"}</strong></span>
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
                        <th className="px-6 py-3 text-center">Số lượng chuyển</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                      {isDetailsLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <FiLoader className="animate-spin text-2xl text-blue-600 mx-auto" />
                            <p className="text-xs text-gray-400 mt-2">Đang tải sản phẩm chi tiết...</p>
                          </td>
                        </tr>
                      ) : pckDetails.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                            Không có sản phẩm nào trong chi tiết phiếu chuyển.
                          </td>
                        </tr>
                      ) : (
                        pckDetails.map((dt) => (
                          <tr key={dt.maBienThe} className="hover:bg-gray-50/30">
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
                                {dt.mauSac && <span>Màu: <strong>{dt.mauSac}</strong></span>}
                                {dt.dungLuong && <span>| Dung lượng: <strong>{dt.dungLuong}</strong></span>}
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
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ghi chú phiếu chuyển</span>
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
                    Phiếu này đang chờ được duyệt để thực hiện cập nhật kho hàng.
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
