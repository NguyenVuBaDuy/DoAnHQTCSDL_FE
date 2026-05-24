import { useState, useMemo } from "react";
import {
  FiDownload,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiArrowRight,
} from "react-icons/fi";
import { useGetCuaHangs } from "../hooks/useCuaHang";

import { format } from "date-fns";
import { CuaHangModal } from "../components/CuaHangModal";
import SuccessModal from "../../../components/common/SuccessModal";
import CuaHangDetailDrawer from "../components/CuaHangDetailDrawer";
import type { CuaHang } from "../../../types/cua-hang";
import { ExportExcelModal } from "../../../components/common/ExportExcelModal";
import type { ExcelColumn } from "../../../utils/excelUtils";

const CuaHangPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCuaHang, setSelectedCuaHang] = useState<CuaHang | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { data: cuaHangsResponse, isLoading, isError } = useGetCuaHangs();
  const cuaHangs = useMemo(
    () => cuaHangsResponse?.data || [],
    [cuaHangsResponse?.data],
  );

  // Derived state for stats
  const stats = useMemo(() => {
    let active = 0;
    let paused = 0;
    let closed = 0;
    cuaHangs.forEach((ch) => {
      // Assuming these are the status strings. Adjust if backend uses different ones.
      if (ch.trangThai === "HoatDong") active++;
      else if (ch.trangThai === "TamNgung") paused++;
      else if (ch.trangThai === "DongCua" || ch.trangThai === "KhoaCung")
        closed++;
      else active++; // Default fallback
    });
    return {
      total: cuaHangs.length,
      active,
      paused,
      closed,
    };
  }, [cuaHangs]);

  // Filtered list
  const filteredCuaHangs = useMemo(() => {
    return cuaHangs.filter((ch) => {
      const matchSearch =
        ch.tenCh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.diaChi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.sdt.includes(searchTerm);
      const matchStatus = statusFilter ? ch.trangThai === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [cuaHangs, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    if (status === "HoatDong" || !status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          HOẠT ĐỘNG
        </span>
      );
    }
    if (status === "TamNgung") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          TẠM NGƯNG
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ĐÓNG CỬA
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const excelColumns: ExcelColumn<CuaHang>[] = useMemo(
    () => [
      { header: "Mã Cửa Hàng", key: "maCh" },
      { header: "Tên Cửa Hàng", key: "tenCh" },
      { header: "Số Điện Thoại", key: "sdt" },
      { header: "Email", key: "email" },
      { header: "Địa Chỉ", key: "diaChi" },
      {
        header: "Ngày Khai Trương",
        key: "ngayKhaiTruong",
        transform: (val) => formatDate(val),
      },
      {
        header: "Trạng Thái",
        key: "trangThai",
        transform: (val) => {
          if (val === "HoatDong") return "Hoạt động";
          if (val === "TamNgung") return "Tạm ngưng";
          if (val === "DongCua" || val === "KhoaCung") return "Đóng cửa";
          return val || "Hoạt động";
        },
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full p-2">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý cửa hàng
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
          >
            <FiDownload />
            Xuất Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <FiPlus />
            Thêm cửa hàng
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Tổng cửa hàng
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {stats.total}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">
            Đang hoạt động
          </span>
          <span className="text-2xl font-bold text-[#16A34A]">
            {stats.active}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Tạm ngưng</span>
          <span className="text-2xl font-bold text-[#CA8A04]">
            {stats.paused}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">Đóng cửa</span>
          <span className="text-2xl font-bold text-[#DC2626]">
            {stats.closed}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-6 items-center">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, địa chỉ, số điện thoại..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="w-48">
          <div className="relative">
            <select
              className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="HoatDong">Đang hoạt động</option>
              <option value="TamNgung">Tạm ngưng</option>
              <option value="DongCua">Đóng cửa</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Đã xảy ra lỗi khi tải dữ liệu!
        </div>
      ) : filteredCuaHangs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Không tìm thấy cửa hàng nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCuaHangs.map((ch) => (
            <div
              key={ch.maCh}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3
                    className="text-lg font-bold text-gray-900 line-clamp-1"
                    title={ch.tenCh}
                  >
                    {ch.tenCh}
                  </h3>
                  {getStatusBadge(ch.trangThai)}
                </div>

                <div className="flex flex-col gap-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-start gap-2.5">
                    <FiMapPin className="mt-0.5 shrink-0 text-gray-400" />
                    <span className="line-clamp-2" title={ch.diaChi}>
                      {ch.diaChi}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiPhone className="shrink-0 text-gray-400" />
                    <span>{ch.sdt}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiMail className="shrink-0 text-gray-400" />
                    <span className="truncate" title={ch.email}>
                      {ch.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiCalendar className="shrink-0 text-gray-400" />
                    <span>Ngày hoạt động: {formatDate(ch.ngayKhaiTruong)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        NHÂN VIÊN
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        12
                      </div>
                    </div>
                    <div className="border-l border-r border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        DOANH THU
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        285M
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        TỒN KHO
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        1.243
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="bg-blue-50 border-t border-gray-100 p-3 flex justify-center items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer text-sm font-medium"
                onClick={() => {
                  setSelectedCuaHang(ch);
                  setIsDrawerOpen(true);
                }}
              >
                Xem chi tiết
                <FiArrowRight />
              </div>
            </div>
          ))}
        </div>
      )}

      <CuaHangModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccessAction={() => setIsSuccessModalOpen(true)}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Thêm thành công"
        message="Cửa hàng mới đã được thêm vào hệ thống."
      />

      <CuaHangDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cuaHang={selectedCuaHang}
      />

      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={filteredCuaHangs}
        columns={excelColumns}
        defaultFileName="Danh_Sach_Cua_Hang"
        sheetName="Cửa Hàng"
      />
    </div>
  );
};

export default CuaHangPage;
