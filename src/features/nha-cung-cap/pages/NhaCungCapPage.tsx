import { useState, useEffect } from "react";
import { FiDownload, FiPlus, FiSearch, FiMoreHorizontal, FiChevronDown } from "react-icons/fi";
import { useGetNhaCungCaps, useChangeStatusNhaCungCap } from "../hooks/useNhaCungCap";
import type { NhaCungCap } from "../../../types/nha-cung-cap";
import { useDebounce } from "../../../hooks/useDebounce";
import { toast } from "react-hot-toast";
import NhaCungCapModal from "../components/NhaCungCapModal";
import NhaCungCapDetailDrawer from "../components/NhaCungCapDetailDrawer";

const NhaCungCapPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNhaCungCap, setSelectedNhaCungCap] = useState<NhaCungCap | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingNhaCungCap, setViewingNhaCungCap] = useState<NhaCungCap | null>(null);

  const { data: apiResponse, isLoading, isError } = useGetNhaCungCaps();
  const rawNhaCungCaps = apiResponse?.data || [];

  const changeStatusMutation = useChangeStatusNhaCungCap();

  // Reset page when search term changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearchTerm]);

  const handleOpenModal = () => {
    setSelectedNhaCungCap(null);
    setIsModalOpen(true);
  };

  const handleEditNhaCungCap = (ncc: NhaCungCap) => {
    setSelectedNhaCungCap(ncc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNhaCungCap(null);
  };

  const handleViewNhaCungCap = (ncc: NhaCungCap) => {
    setViewingNhaCungCap(ncc);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setViewingNhaCungCap(null);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    changeStatusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success("Cập nhật trạng thái thành công!"),
        onError: (error: any) => {
          console.error("Lỗi cập nhật trạng thái:", error);
          toast.error(
            error?.response?.data?.message || "Cập nhật trạng thái thất bại!",
          );
        },
      },
    );
  };

  // Filter suppliers based on search query
  const filteredNhaCungCaps = rawNhaCungCaps.filter((ncc) => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      ncc.tenNcc.toLowerCase().includes(query) ||
      (ncc.sdt && ncc.sdt.toLowerCase().includes(query)) ||
      (ncc.email && ncc.email.toLowerCase().includes(query)) ||
      (ncc.maSoThue && ncc.maSoThue.toLowerCase().includes(query)) ||
      (ncc.diaChi && ncc.diaChi.toLowerCase().includes(query))
    );
  });

  const totalElements = filteredNhaCungCaps.length;
  const totalPages = Math.ceil(totalElements / pagination.size);

  const paginatedNhaCungCaps = filteredNhaCungCaps.slice(
    pagination.page * pagination.size,
    (pagination.page + 1) * pagination.size,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const totalActive = rawNhaCungCaps.filter((x) => x.trangThai === "HoatDong").length;
  const totalInactive = rawNhaCungCaps.filter((x) => x.trangThai !== "HoatDong").length;

  return (
    <div className="flex flex-col gap-6 w-full h-full p-2">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý nhà cung cấp
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
            <FiDownload />
            Xuất Excel
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <FiPlus />
            Thêm nhà cung cấp
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Tổng nhà cung cấp
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {rawNhaCungCaps.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Đang hoạt động
          </span>
          <span className="text-2xl font-bold text-[#16A34A]">{totalActive}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Dừng hợp tác
          </span>
          <span className="text-2xl font-bold text-[#DC2626]">{totalInactive}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-6 items-end">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên nhà cung cấp, SĐT, email, mã số thuế..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Mã NCC</th>
                <th className="px-6 py-4 font-medium">Tên nhà cung cấp</th>
                <th className="px-6 py-4 font-medium">SĐT</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Đã xảy ra lỗi khi tải dữ liệu!
                  </td>
                </tr>
              ) : paginatedNhaCungCaps.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy nhà cung cấp nào.
                  </td>
                </tr>
              ) : (
                paginatedNhaCungCaps.map((row) => (
                  <tr
                    key={row.maNcc}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.maNcc}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.tenNcc}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.sdt || "--"}</td>
                    <td className="px-6 py-4 text-gray-600">{row.email || "--"}</td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={row.trangThai}
                          onChange={(e) =>
                            handleStatusChange(row.maNcc, e.target.value)
                          }
                          disabled={
                            changeStatusMutation.isPending &&
                            changeStatusMutation.variables?.id === row.maNcc
                          }
                          className={`appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-none pr-5 focus:ring-2 focus:ring-blue-500 transition-colors ${
                            row.trangThai === "HoatDong"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          } disabled:opacity-50`}
                        >
                          <option value="HoatDong" className="bg-white text-gray-900">
                            Hoạt động
                          </option>
                          <option value="DungHopTac" className="bg-white text-gray-900">
                            Dừng hợp tác
                          </option>
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 opacity-50 text-gray-700" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleViewNhaCungCap(row)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100 mr-2 text-sm font-medium"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleEditNhaCungCap(row)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50 mr-2 text-sm font-medium"
                        >
                          Sửa
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                          <FiMoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-500">
            Hiển thị{" "}
            {totalElements > 0
              ? pagination.page * pagination.size + 1
              : 0}{" "}
            đến{" "}
            {Math.min(
              (pagination.page + 1) * pagination.size,
              totalElements,
            )}{" "}
            trong số {totalElements} mục
          </span>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={pagination.page === 0}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  pagination.page === idx
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
                onClick={() => handlePageChange(idx)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={pagination.page >= totalPages - 1}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <NhaCungCapModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedNhaCungCap}
      />

      <NhaCungCapDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        nhaCungCap={viewingNhaCungCap}
      />
    </div>
  );
};

export default NhaCungCapPage;
