import { useState, useEffect } from "react";
import { FiDownload, FiPlus, FiSearch, FiMoreHorizontal } from "react-icons/fi";
import { useGetKhachHangs } from "../hooks/useKhachHang";
import type { GetKhachHangParams } from "../../../types/khach-hang";
import { useDebounce } from "../../../hooks/useDebounce";
// import { useAppSelector } from "../../../store";
import { format } from "date-fns";
import KhachHangModal from "../components/KhachHangModal";
import type { KhachHang } from "../../../types/khach-hang";

const KhachHangPage = () => {
  // const { user } = useAppSelector((state) => state.auth);

  const [params, setParams] = useState<GetKhachHangParams>({
    page: 0,
    size: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKhachHang, setSelectedKhachHang] = useState<KhachHang | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParams((prev) => ({
      ...prev,
      search: debouncedSearchTerm,
      page: 0,
    }));
  }, [debouncedSearchTerm]);

  const handleOpenModal = () => {
    setSelectedKhachHang(null);
    setIsModalOpen(true);
  };

  const handleEditKhachHang = (khachHang: KhachHang) => {
    setSelectedKhachHang(khachHang);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKhachHang(null);
  };

  const { data: apiResponse, isLoading, isError } = useGetKhachHangs(params);
  const khachHangs = apiResponse?.data?.content || [];
  const totalElements = apiResponse?.data?.totalElements || 0;
  const totalPages = Math.ceil(totalElements / (params.size || 10));

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
          Quản lý khách hàng
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
            Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Tổng khách hàng
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {totalElements}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Khách hàng mới (tháng này)
          </span>
          <span className="text-2xl font-bold text-[#16A34A]">-</span>
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
              placeholder="Tìm theo tên, SĐT, email..."
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
                <th className="px-6 py-4 font-medium">Mã KH</th>
                <th className="px-6 py-4 font-medium">Họ tên</th>
                <th className="px-6 py-4 font-medium">SĐT</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Ngày sinh</th>
                <th className="px-6 py-4 font-medium">Giới tính</th>
                <th className="px-6 py-4 font-medium">Ngày ĐK</th>
                <th className="px-6 py-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Đã xảy ra lỗi khi tải dữ liệu!
                  </td>
                </tr>
              ) : khachHangs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                khachHangs.map((row) => (
                  <tr
                    key={row.maKh}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      KH{String(row.maKh).padStart(4, "0")}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.hoTen}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.sdt}</td>
                    <td className="px-6 py-4 text-gray-600">{row.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {row.ngaySinh
                        ? format(new Date(row.ngaySinh), "dd/MM/yyyy")
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{row.gioiTinh}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {row.ngayDangKy
                        ? format(new Date(row.ngayDangKy), "dd/MM/yyyy")
                        : ""}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100 mr-2 text-sm font-medium">
                          Chi tiết
                        </button>
                        <button 
                          onClick={() => handleEditKhachHang(row)}
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
            {khachHangs.length > 0
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

      <KhachHangModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedKhachHang}
        onSuccessAction={() => {
          // You might want to refresh data here if not handled by invalidateQueries
        }}
      />
    </div>
  );
};

export default KhachHangPage;
