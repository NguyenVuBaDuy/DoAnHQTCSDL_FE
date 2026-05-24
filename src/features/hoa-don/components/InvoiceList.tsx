import { useState, useEffect, useDeferredValue } from "react";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiCalendar,
  FiFilter,
  FiGrid,
  FiUser,
  FiActivity,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import { useAppSelector } from "../../../store";
import { hoaDonService } from "../../../services/hoaDonService";
import { cuaHangService } from "../../../services/cuaHangService";
import type { HoaDonResponse } from "../../../types/hoa-don";
import type { CuaHang } from "../../../types/cua-hang";
import { InvoiceDetailModal } from "./InvoiceDetailModal";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val || 0);
};

export const InvoiceList = () => {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom || user?.nhanvien?.chucvu;
  const isAdmin = role === "Admin";
  const userStoreId = user?.nhanvien?.mach;

  // Stores
  const [stores, setStores] = useState<CuaHang[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | "">("");

  // Pagination & List state
  const [invoices, setInvoices] = useState<HoaDonResponse[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  // Detail Modal
  const [selectedInvoice, setSelectedInvoice] = useState<HoaDonResponse | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Actions state
  const [isActionPending, setIsActionPending] = useState(false);

  // Load stores list for Admin
  useEffect(() => {
    if (isAdmin) {
      const fetchStores = async () => {
        try {
          const res = await cuaHangService.getCuaHangs();
          if (res.success && res.data) {
            setStores(res.data);
          }
        } catch (err) {
          console.error("Error fetching stores list:", err);
        }
      };
      fetchStores();
    }
  }, [isAdmin]);

  // Load paginated Invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      // API page parameter is 1-indexed, so we do page + 1
      const res = await hoaDonService.getAll({
        page: page + 1,
        size,
      });

      if (res.success && res.data) {
        setInvoices(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(Math.ceil((res.data.totalElements || 0) / size) || 1);
      } else {
        toast.error(res.message || "Không thể tải danh sách hóa đơn");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Có lỗi xảy ra khi tải danh sách hóa đơn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, size]);

  // Client-side filtration for advanced filters & searching since the backend `/api/hoa-don` only implements paging
  const filteredInvoices = invoices.filter((inv) => {
    // 1. Store filtering
    if (isAdmin) {
      if (selectedStoreId !== "" && inv.maCh !== selectedStoreId) return false;
    } else if (userStoreId) {
      // Regular staff can only see their store's invoices
      if (inv.maCh !== userStoreId) return false;
    }

    // 2. Status filtering
    if (statusFilter !== "" && inv.trangThai !== statusFilter) return false;

    // 3. Type filtering
    if (typeFilter !== "" && inv.loaiHd !== typeFilter) return false;

    // 4. Searching (by ID, Customer name, Customer SĐT, Voucher code, Cashier)
    if (deferredSearch.trim() !== "") {
      const search = deferredSearch.toLowerCase();
      const matchId = inv.maHd.toString() === search;
      const matchCustomer = inv.tenKh?.toLowerCase().includes(search);
      const matchPhone = inv.sdtKh?.includes(search);
      const matchVoucher = inv.maVoucher?.toLowerCase().includes(search);
      const matchCashier =
        inv.tenNv?.toLowerCase().includes(search) ||
        inv.maNv?.toLowerCase().includes(search);

      return (
        matchId || matchCustomer || matchPhone || matchVoucher || matchCashier
      );
    }

    return true;
  });

  const handleOpenDetails = (inv: HoaDonResponse) => {
    setSelectedInvoice(inv);
    setIsDetailOpen(true);
  };

  const handleCancelInvoice = async (maHd: number) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn HỦY hóa đơn này? Thao tác này sẽ tự động khôi phục số lượng tồn kho.",
    );
    if (!confirm) return;

    setIsActionPending(true);
    try {
      const res = await hoaDonService.cancelHoaDon(maHd);
      if (res.success) {
        toast.success("Hủy hóa đơn thành công và đã hoàn trả kho hàng!");
        fetchInvoices();
      } else {
        toast.error(res.message || "Không thể hủy hóa đơn");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi khi hủy hóa đơn");
    } finally {
      setIsActionPending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DaThanhToan":
      case "Paid":
        return (
          <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-bold text-xs border border-green-200">
            Đã thanh toán
          </span>
        );
      case "ChoThanhToan":
      case "Pending":
        return (
          <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full font-bold text-xs border border-yellow-200">
            Chờ thanh toán
          </span>
        );
      case "Huy":
      case "DaHuy":
      case "Cancelled":
        return (
          <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full font-bold text-xs border border-red-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-xs border border-blue-200">
            {status}
          </span>
        );
    }
  };

  const invoiceStats = {
    total: filteredInvoices.length,
    revenue: filteredInvoices
      .filter((i) => i.trangThai === "DaThanhToan" || i.trangThai === "Paid")
      .reduce((sum, item) => sum + item.tongTien, 0),
    cancelled: filteredInvoices.filter(
      (i) =>
        i.trangThai === "Huy" ||
        i.trangThai === "DaHuy" ||
        i.trangThai === "Cancelled",
    ).length,
  };

  return (
    <div className="flex flex-col gap-4 min-h-0 select-none">
      {/* Quick Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block">
              Số lượng đơn hàng hiển thị
            </span>
            <span className="text-xl font-bold text-gray-900 leading-tight">
              {invoiceStats.total} đơn
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <span className="text-xl font-black">₫</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block">
              Doanh thu đã thanh toán
            </span>
            <span className="text-xl font-bold text-green-600 leading-tight">
              {formatCurrency(invoiceStats.revenue)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <FiTrash2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block">
              Số đơn đã hủy bỏ
            </span>
            <span className="text-xl font-bold text-red-600 leading-tight">
              {invoiceStats.cancelled} đơn
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <FiFilter className="text-blue-600" /> Bộ lọc hóa đơn
          </span>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setTypeFilter("");
              setSelectedStoreId("");
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mã HD, Tên KH, SĐT, Voucher..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
            />
          </div>

          {/* 2. Store filter (Admin only) */}
          {isAdmin ? (
            <select
              value={selectedStoreId}
              onChange={(e) =>
                setSelectedStoreId(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả cửa hàng</option>
              {stores.map((ch) => (
                <option key={ch.maCh} value={ch.maCh}>
                  {ch.tenCh}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 flex items-center">
              Cửa hàng: #{userStoreId || "Mặc định"}
            </div>
          )}

          {/* 3. Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ChoThanhToan">Chờ thanh toán</option>
            <option value="DaThanhToan">Đã thanh toán</option>
            <option value="Huy">Đã hủy</option>
          </select>

          {/* 4. Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả loại đơn</option>
            <option value="TaiQuay">Tại quầy (POS)</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

      {/* Table Data View */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                Đang tải danh sách hóa đơn...
              </span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="p-4 bg-gray-50 rounded-full mb-3 border">
                <FiGrid size={24} />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Không tìm thấy hóa đơn nào
              </span>
              <span className="text-xs text-gray-500 max-w-xs mt-1">
                Không tìm thấy kết quả hóa đơn phù hợp với điều kiện lọc hiện
                tại.
              </span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200/80">
                <tr className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                  <th className="p-4">Mã HD</th>
                  <th className="p-4">Cửa hàng</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4 text-right">Tổng thanh toán</th>
                  <th className="p-4">Phương thức</th>
                  <th className="p-4">Ngày lập</th>
                  <th className="p-4">Loại HD</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredInvoices.map((inv) => {
                  const isHuy =
                    inv.trangThai === "Huy" ||
                    inv.trangThai === "DaHuy" ||
                    inv.trangThai === "Cancelled";
                  return (
                    <tr
                      key={inv.maHd}
                      className="hover:bg-blue-50/20 transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetails(inv)}
                    >
                      <td className="p-4 font-mono font-bold text-gray-900 text-xs">
                        #{inv.maHd}
                      </td>
                      <td className="p-4 font-medium text-gray-600 max-w-[130px] truncate">
                        {inv.tenCh || `#${inv.maCh}`}
                      </td>
                      <td className="p-4">
                        {inv.maKh ? (
                          <div>
                            <span className="font-semibold text-gray-800 block text-xs">
                              {inv.tenKh}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {inv.sdtKh}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Khách vãng lai
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-extrabold text-blue-600">
                        {formatCurrency(inv.tongTien)}
                      </td>
                      <td className="p-4 font-medium text-gray-600">
                        {inv.phuongThucThanhToan === "TienMat"
                          ? "Tiền mặt"
                          : "Chuyển khoản"}
                      </td>
                      <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-gray-400" />
                          {new Date(inv.ngayLap).toLocaleDateString("vi-VN")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.loaiHd === "TaiQuay"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {inv.loaiHd === "TaiQuay" ? "Tại quầy" : "Online"}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(inv.trangThai)}</td>
                      <td
                        className="p-4 text-center"
                        onClick={(e) => e.stopPropagation()} // Stop row propagation for actions
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(inv)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <FiEye size={14} />
                          </button>
                          {!isHuy && (
                            <button
                              onClick={() => handleCancelInvoice(inv.maHd)}
                              disabled={isActionPending}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hủy hóa đơn"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Paging Footer controls */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Hiển thị</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-500">
              dòng trên tổng số <b>{totalElements}</b> hóa đơn
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent text-gray-600"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700 px-3">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent text-gray-600"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Dialog Modal */}
      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onRefresh={fetchInvoices}
      />
    </div>
  );
};
