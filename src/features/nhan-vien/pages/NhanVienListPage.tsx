import { useState, useEffect } from "react";
import {
  FiDownload,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiMoreHorizontal,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  useGetNhanViens,
  useUpdateTrangThaiNhanVien,
} from "../hooks/useNhanVien";
import { useGetCuaHangs } from "../../cua-hang/hooks/useCuaHang";
import type { GetNhanVienParams } from "../../../types/nhan-vien";
import { roles, getRoleName } from "../../../utils/roleUtils";
import { accountStatuses } from "../../../utils/statusUtils";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAppSelector } from "../../../store";
import NhanVienModal from "../components/NhanVienModal";
import NhanVienDetailDrawer from "../components/NhanVienDetailDrawer";
import SuccessModal from "../../../components/common/SuccessModal";

const NhanVienListPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom;

  const [params, setParams] = useState<GetNhanVienParams>({
    page: 0,
    size: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNhanVien, setEditingNhanVien] = useState<
    import("../../../types/nhan-vien").NhanVienListItem | null
  >(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [viewingNhanVien, setViewingNhanVien] = useState<
    import("../../../types/nhan-vien").NhanVienListItem | null
  >(null);

  const handleAddClick = () => {
    setEditingNhanVien(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (
    nhanVien: import("../../../types/nhan-vien").NhanVienListItem,
  ) => {
    setEditingNhanVien(nhanVien);
    setIsModalOpen(true);
  };

  const handleViewClick = (
    nhanVien: import("../../../types/nhan-vien").NhanVienListItem,
  ) => {
    setViewingNhanVien(nhanVien);
    setIsDetailDrawerOpen(true);
  };

  const updateStatusMutation = useUpdateTrangThaiNhanVien();

  const handleStatusChange = (maNv: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { maNv, data: { trangThai: newStatus } },
      {
        onSuccess: () => toast.success("Cập nhật trạng thái thành công!"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.error("Lỗi cập nhật trạng thái:", error);
          toast.error(
            error?.response?.data?.message || "Cập nhật trạng thái thất bại!",
          );
        },
      },
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParams((prev) => ({
      ...prev,
      search: debouncedSearchTerm,
      page: 0,
    }));
  }, [debouncedSearchTerm]);

  const { data: apiResponse, isLoading, isError } = useGetNhanViens(params);
  const nhanViens = apiResponse?.data?.content || [];
  const totalElements = apiResponse?.data?.totalElements || 0;
  const totalPages = Math.ceil(totalElements / (params.size || 10));

  const { data: cuaHangsResponse } = useGetCuaHangs();
  const cuaHangs = cuaHangsResponse?.data || [];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setParams((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-2">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý nhân viên
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
            <FiDownload />
            Xuất Excel
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <FiPlus />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Tổng nhân viên
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {totalElements}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Đang làm việc
          </span>
          <span className="text-2xl font-bold text-[#16A34A]">-</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Nghỉ phép</span>
          <span className="text-2xl font-bold text-[#CA8A04]">-</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Tài khoản bị khóa
          </span>
          <span className="text-2xl font-bold text-[#DC2626]">-</span>
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
              placeholder="Tìm theo tên, mã NV, CCCD..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {role !== "QuanLyCuaHang" && (
          <div className="flex flex-col gap-1.5 w-48">
            <label className="text-sm font-medium text-gray-700">
              Cửa hàng
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                value={params.mach || ""}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    mach: e.target.value ? Number(e.target.value) : undefined,
                    page: 0,
                  }))
                }
              >
                <option value="">Tất cả</option>
                {cuaHangs.map((ch) => (
                  <option key={ch.maCh} value={ch.maCh}>
                    {ch.tenCh}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 w-48">
          <label className="text-sm font-medium text-gray-700">Chức vụ</label>
          <div className="relative">
            <select
              className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              value={params.chucvu || ""}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  chucvu: e.target.value || undefined,
                  page: 0,
                }))
              }
            >
              <option value="">Tất cả</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-48">
          <label className="text-sm font-medium text-gray-700">
            Trạng thái TK
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              value={params.trangthai || ""}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  trangthai: e.target.value || undefined,
                  page: 0,
                }))
              }
            >
              <option value="">Tất cả</option>
              {accountStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Mã NV</th>
                <th className="px-6 py-4 font-medium">Họ tên</th>
                <th className="px-6 py-4 font-medium">Cửa hàng</th>
                <th className="px-6 py-4 font-medium">Chức vụ</th>
                <th className="px-6 py-4 font-medium">Số điện thoại</th>
                <th className="px-6 py-4 font-medium">Trạng thái TK</th>
                <th className="px-6 py-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Đã xảy ra lỗi khi tải dữ liệu!
                  </td>
                </tr>
              ) : nhanViens.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy nhân viên nào.
                  </td>
                </tr>
              ) : (
                nhanViens.map((row) => (
                  <tr
                    key={row.maNv}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.maNv}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.hoTen}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.tenCh}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {getRoleName(row.chucVu, row.chucVu)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.sdt}</td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={row.trangThai}
                          onChange={(e) =>
                            handleStatusChange(row.maNv, e.target.value)
                          }
                          disabled={
                            updateStatusMutation.isPending &&
                            updateStatusMutation.variables?.maNv === row.maNv
                          }
                          className={`appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-none pr-5 focus:ring-2 focus:ring-blue-500 transition-colors ${
                            row.trangThai === "HoatDong"
                              ? "bg-green-100 text-green-800"
                              : row.trangThai === "KhoaTam"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          } disabled:opacity-50`}
                        >
                          {accountStatuses.map((status) => (
                            <option
                              key={status.value}
                              value={status.value}
                              className="bg-white text-gray-900"
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 opacity-50" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleViewClick(row)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100 mr-2 text-sm font-medium"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleEditClick(row)}
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
            {nhanViens.length > 0
              ? (params.page || 0) * (params.size || 10) + 1
              : 0}{" "}
            đến{" "}
            {Math.min(
              ((params.page || 0) + 1) * (params.size || 10),
              totalElements,
            )}{" "}
            trong số {totalElements} mục
          </span>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={(params.page || 0) === 0}
              onClick={() => handlePageChange((params.page || 0) - 1)}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  (params.page || 0) === idx
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
              disabled={(params.page || 0) >= totalPages - 1}
              onClick={() => handlePageChange((params.page || 0) + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <NhanVienModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cuaHangs={cuaHangs}
        initialData={editingNhanVien}
        onSuccessAction={() => setIsSuccessModalOpen(true)}
      />

      <NhanVienDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        nhanVien={viewingNhanVien}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={editingNhanVien ? "Cập nhật thành công" : "Thêm thành công"}
        message={
          editingNhanVien
            ? "Thông tin nhân viên đã được cập nhật."
            : "Nhân viên mới đã được thêm vào hệ thống."
        }
      />
    </div>
  );
};

export default NhanVienListPage;
