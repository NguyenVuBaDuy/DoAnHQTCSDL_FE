import { useState, useEffect } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiTrash2, 
  FiEdit3, 
  FiCopy, 
  FiCheck, 
  FiTag, 
  FiCalendar, 
  FiActivity, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiClock 
} from "react-icons/fi";
import { useGetVouchers, useUpdateVoucher, useDeleteVoucher } from "../hooks/useVoucher";
import type { VoucherResponse } from "../../../types/voucher";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAppSelector } from "../../../store";
import { toast } from "react-hot-toast";
import VoucherModal from "../components/VoucherModal";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "--";
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "--";
  }
};

const VoucherPage = () => {
  // Auth state & role checking
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom || user?.nhanvien?.chucvu;
  const isAdmin = role === "Admin";

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [pagination, setPagination] = useState({
    page: 1, // 1-based index for API
    size: 10,
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | null>(null);

  // Fetch paginated data
  const { data: apiResponse, isLoading, isError, refetch } = useGetVouchers({
    search: debouncedSearchTerm.trim() || undefined,
    page: pagination.page,
    size: pagination.size,
  });

  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, typeFilter, statusFilter]);

  const handleOpenCreateModal = () => {
    if (!isAdmin) return;
    setSelectedVoucher(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VoucherResponse) => {
    setSelectedVoucher(v);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChange = (voucher: VoucherResponse, newStatus: string) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền chỉnh sửa thông tin voucher!");
      return;
    }

    const originalStatus = voucher.trangThai;
    if (originalStatus === newStatus) return;

    const payload = {
      ...voucher,
      trangThai: newStatus,
    };

    updateMutation.mutate(
      { code: voucher.maVoucher, data: payload },
      {
        onSuccess: () => {
          toast.success(`Đã cập nhật trạng thái voucher sang ${newStatus === "KichHoat" ? "Kích hoạt" : "Vô hiệu"}`);
        },
        onError: (err: any) => {
          console.error(err);
          toast.error(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
        },
      }
    );
  };

  const handleDeleteVoucher = (code: string) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền xóa voucher!");
      return;
    }

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa voucher [${code}]? Hành động này không thể hoàn tác.`);
    if (!confirmDelete) return;

    deleteMutation.mutate(code, {
      onSuccess: () => {
        toast.success("Xóa voucher thành công!");
      },
      onError: (err: any) => {
        console.error(err);
        toast.error(err?.response?.data?.message || "Xóa voucher thất bại");
      },
    });
  };

  // Get raw list from API and apply local frontend filters for Type & Status
  const rawVouchersList = apiResponse?.data?.content || [];
  
  const filteredVouchers = rawVouchersList.filter((v) => {
    // Type Filter
    if (typeFilter !== "all" && v.loai !== typeFilter) return false;
    
    // Status Filter
    if (statusFilter === "all") return true;
    if (statusFilter === "KichHoat") return v.trangThai === "KichHoat";
    if (statusFilter === "VoHieu") return v.trangThai === "VoHieu";
    
    // Expired or Active dates logic
    const now = new Date();
    const isExpired = new Date(v.ngayHetHan) < now;
    if (statusFilter === "Expired") return isExpired;
    if (statusFilter === "ActiveAndValid") {
      return v.trangThai === "KichHoat" && !isExpired && new Date(v.ngayBatDau) <= now && v.soLuongDaDung < v.soLuong;
    }
    
    return true;
  });

  const totalElements = apiResponse?.data?.totalElements || filteredVouchers.length;
  const totalPages = apiResponse?.data?.totalElements 
    ? Math.ceil(apiResponse.data.totalElements / pagination.size) 
    : 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Live computation of KPI stats based on all currently loaded vouchers
  const statTotal = rawVouchersList.length;
  const statActive = rawVouchersList.filter(
    (v) => v.trangThai === "KichHoat" && new Date(v.ngayHetHan) > new Date()
  ).length;
  const statFullyRedeemed = rawVouchersList.filter(
    (v) => v.soLuongDaDung >= v.soLuong
  ).length;
  const statExpired = rawVouchersList.filter(
    (v) => new Date(v.ngayHetHan) < new Date()
  ).length;

  // Validity status helper
  const getValidityBadge = (v: VoucherResponse) => {
    const now = new Date();
    const start = new Date(v.ngayBatDau);
    const end = new Date(v.ngayHetHan);

    if (end < now) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          <FiClock size={12} /> Hết hạn
        </span>
      );
    }
    if (v.soLuongDaDung >= v.soLuong) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
          <FiAlertTriangle size={12} /> Hết số lượng
        </span>
      );
    }
    if (start > now) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <FiCalendar size={12} /> Sắp diễn ra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        <FiActivity size={12} /> Đang chạy
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-2">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E0F2FE] text-[#0369A1] rounded-xl">
            <FiTag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Quản lý Voucher Khuyến Mãi
            </h1>
            <p className="text-sm text-gray-500 mt-1">Thiết lập, theo dõi và quản lý các đợt phát hành mã giảm giá</p>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0057AD] text-white rounded-xl hover:bg-blue-800 transition-all font-bold text-sm shadow-md"
          >
            <FiPlus className="stroke-[3]" />
            Tạo Voucher Mới
          </button>
        )}
      </div>

      {/* Quick Statistics KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vouchers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-semibold">Phát hành</span>
            <span className="text-3xl font-extrabold text-gray-900">{statTotal}</span>
          </div>
          <div className="p-3 bg-gray-50 text-gray-500 rounded-xl">
            <FiTag className="w-6 h-6" />
          </div>
        </div>

        {/* Active & Valid */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-semibold">Đang hoạt động</span>
            <span className="text-3xl font-extrabold text-[#16A34A]">{statActive}</span>
          </div>
          <div className="p-3 bg-green-50 text-[#16A34A] rounded-xl">
            <FiTrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Fully Redeemed */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-semibold">Hết số lượng</span>
            <span className="text-3xl font-extrabold text-[#EA580C]">{statFullyRedeemed}</span>
          </div>
          <div className="p-3 bg-orange-50 text-[#EA580C] rounded-xl">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-semibold">Đã hết hạn</span>
            <span className="text-3xl font-extrabold text-gray-400">{statExpired}</span>
          </div>
          <div className="p-3 bg-red-50 text-red-400 rounded-xl">
            <FiClock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Tìm kiếm</label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 stroke-[2]" />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên voucher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Discount Type Filter */}
        <div className="w-full md:w-48 flex flex-col gap-1.5 shrink-0">
          <label className="text-sm font-bold text-gray-700">Loại giảm giá</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          >
            <option value="all">Tất cả</option>
            <option value="PhanTram">Phần trăm (%)</option>
            <option value="TienMat">Tiền mặt (đ)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-52 flex flex-col gap-1.5 shrink-0">
          <label className="text-sm font-bold text-gray-700">Trạng thái lọc</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          >
            <option value="all">Tất cả</option>
            <option value="ActiveAndValid">Đang chạy & Khả dụng</option>
            <option value="KichHoat">Kích hoạt</option>
            <option value="VoHieu">Vô hiệu hóa</option>
            <option value="Expired">Đã hết hạn</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Mã Voucher</th>
                <th className="px-6 py-4 font-bold">Tên chương trình</th>
                <th className="px-6 py-4 font-bold">Mức giảm</th>
                <th className="px-6 py-4 font-bold">Điều kiện</th>
                <th className="px-6 py-4 font-bold">Đã dùng / Phát hành</th>
                <th className="px-6 py-4 font-bold">Thời hạn</th>
                <th className="px-6 py-4 font-bold">Hiệu lực</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></span>
                      <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="ml-1">Đang tải danh sách voucher...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-red-500 font-bold">
                    Đã xảy ra lỗi khi tải dữ liệu từ máy chủ!
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-400 font-medium">
                    Không tìm thấy voucher nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((row) => {
                  const usagePercent = Math.min(100, Math.round((row.soLuongDaDung / row.soLuong) * 100)) || 0;
                  const isUsageWarning = usagePercent >= 90;

                  return (
                    <tr
                      key={row.maVoucher}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Code with Copy Badges */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-sm text-[#0057AD] bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 tracking-wider">
                            {row.maVoucher}
                          </span>
                          <button
                            onClick={() => handleCopyCode(row.maVoucher)}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-[#0057AD] transition-all opacity-0 group-hover:opacity-100"
                            title="Copy code"
                          >
                            {copiedCode === row.maVoucher ? (
                              <FiCheck className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <FiCopy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-[#0057AD] transition-colors">{row.tenVoucher}</span>
                          {row.ghiChu && (
                            <span className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic max-w-xs">{row.ghiChu}</span>
                          )}
                        </div>
                      </td>

                      {/* Amount / Type */}
                      <td className="px-6 py-4">
                        {row.loai === "PhanTram" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-extrabold bg-green-50 text-green-700 border border-green-100">
                            Giảm {row.giaTri}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                            -{formatCurrency(row.giaTri)}
                          </span>
                        )}
                      </td>

                      {/* Conditions */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="text-gray-600 font-medium">
                            Đơn từ: <b>{formatCurrency(row.dieuKienToiThieu || 0)}</b>
                          </span>
                          {row.loai === "PhanTram" && row.giaTriToiDa ? (
                            <span className="text-gray-400 font-semibold">
                              Tối đa: <b>{formatCurrency(row.giaTriToiDa)}</b>
                            </span>
                          ) : row.loai === "PhanTram" ? (
                            <span className="text-gray-400 italic">Không giới hạn trần</span>
                          ) : null}
                        </div>
                      </td>

                      {/* Progress Bar Usage */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 w-36">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700">{row.soLuongDaDung} / {row.soLuong}</span>
                            <span className={isUsageWarning ? "text-[#EA580C]" : "text-gray-400"}>
                              {usagePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isUsageWarning ? "bg-[#EA580C]" : "bg-blue-600"
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Period Range */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-gray-500 font-semibold">
                          <span className="flex items-center gap-1"><span className="text-green-500 font-black">•</span> {formatDate(row.ngayBatDau)}</span>
                          <span className="flex items-center gap-1"><span className="text-red-500 font-black">•</span> {formatDate(row.ngayHetHan)}</span>
                        </div>
                      </td>

                      {/* Live validity label */}
                      <td className="px-6 py-4">
                        {getValidityBadge(row)}
                      </td>

                      {/* Status select/toggle */}
                      <td className="px-6 py-4">
                        <select
                          value={row.trangThai}
                          onChange={(e) => handleStatusChange(row, e.target.value)}
                          disabled={!isAdmin || (updateMutation.isPending && updateMutation.variables?.code === row.maVoucher)}
                          className={`appearance-none outline-none inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                            !isAdmin ? "cursor-default" : "cursor-pointer pr-6 font-semibold"
                          } ${
                            row.trangThai === "KichHoat"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          } disabled:opacity-90`}
                        >
                          <option value="KichHoat" className="bg-white text-gray-900">Kích hoạt</option>
                          <option value="VoHieu" className="bg-white text-gray-900">Vô hiệu</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isAdmin ? (
                            <button
                              onClick={() => handleOpenEditModal(row)}
                              className="text-gray-500 hover:text-blue-600 hover:bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold transition-all border border-gray-200 shadow-sm"
                            >
                              Xem
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(row)}
                                className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all"
                                title="Sửa thông tin"
                              >
                                <FiEdit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteVoucher(row.maVoucher)}
                                className="p-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg transition-all"
                                title="Xóa voucher"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto bg-gray-50">
            <span className="text-xs text-gray-500 font-bold">
              Hiển thị bọc trong trang {pagination.page} / {totalPages} (Tổng số {totalElements} mã)
            </span>
            
            <div className="flex gap-1.5">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Trước
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    pagination.page === idx + 1
                      ? "bg-[#0057AD] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                disabled={pagination.page >= totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal create/edit / view */}
      <VoucherModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedVoucher}
        onSuccessAction={refetch}
        readOnly={!isAdmin}
      />
    </div>
  );
};

export default VoucherPage;
