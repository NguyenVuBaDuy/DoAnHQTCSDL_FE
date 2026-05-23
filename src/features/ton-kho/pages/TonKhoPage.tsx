import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  FiBox,
  FiDownload,
  FiFileText,
  FiLoader,
  FiPlus,
  FiSearch,
  FiTruck,
} from "react-icons/fi";
import { phieuNhapService } from "../../../services/phieuNhapService";
import { tonKhoService } from "../../../services/tonKhoService";
import { useAppSelector } from "../../../store";
import type {
  GetPhieuNhapParams,
  PhieuNhapResponse,
} from "../../../types/phieu-nhap";
import type { GetTonKhoParams } from "../../../types/ton-kho";
import { useGetCuaHangs } from "../../cua-hang/hooks/useCuaHang";
import { ChiTietBienTheModal } from "../components/ChiTietBienTheModal";
import { CreatePhieuNhapModal } from "../components/CreatePhieuNhapModal";
import { ProductSelect } from "../components/ProductSelect";
/* eslint-disable @typescript-eslint/no-explicit-any */

const TonKhoPage = () => {
  const [activeTab, setActiveTab] = useState<
    "tong-quan" | "phieu-nhap" | "phieu-chuyen"
  >("tong-quan");
  const [selectedMaBienThe, setSelectedMaBienThe] = useState<number | null>(
    null,
  );

  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom;
  const maCh = user?.nhanvien?.mach;

  const isStoreRole =
    role === "QuanLyCuaHang" ||
    role === "NhanVienKho" ||
    role === "NhanVienBan";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: cuaHangsResponse, isLoading: isCuaHangsLoading } =
    useGetCuaHangs();
  const cuaHangs = cuaHangsResponse?.data || [];
  const canCreatePhieuNhap = role === "Admin" || isStoreRole;

  const [params, setParams] = useState<GetTonKhoParams>({
    page: 0,
    size: 10,
    search: "",
  });

  const [searchValue, setSearchValue] = useState("");

  const [phieuNhapParams, setPhieuNhapParams] = useState<GetPhieuNhapParams>({
    page: 1,
    size: 10,
  });
  const [phieuNhapSearch, setPhieuNhapSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchValue) return prev;
        return { ...prev, search: searchValue, page: 0 };
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ["ton-kho-tong-quan", params, role, maCh],
    queryFn: () => {
      if (isStoreRole && maCh !== undefined && maCh !== null) {
        return tonKhoService.getTonKhoCuaHang(maCh, params);
      }
      return tonKhoService.getTonKhoTongQuan(params);
    },
    enabled:
      activeTab === "tong-quan" &&
      (!isStoreRole || (maCh !== undefined && maCh !== null)),
  });

  const {
    data: phieuNhapResponse,
    isLoading: isPhieuNhapLoading,
    isError: isPhieuNhapError,
  } = useQuery<any>({
    queryKey: ["phieu-nhap", phieuNhapParams],
    queryFn: () => phieuNhapService.getPhieuNhaps(phieuNhapParams),
    enabled: activeTab === "phieu-nhap",
  });

  const tonKhos = response?.data?.content || [];
  const pageData = response?.data;
  const phieuNhaps = phieuNhapResponse?.data?.content || [];
  const phieuNhapPageData = phieuNhapResponse?.data;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    if (status === "DangBan") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          Đang bán
        </span>
      );
    }
    if (status === "NgungBan") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          Ngừng bán
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        {status || "Không rõ"}
      </span>
    );
  };

  const getPhieuNhapStatusBadge = (status: string) => {
    if (status === "DaDuyet") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          Đã duyệt
        </span>
      );
    }
    if (status === "ChoDuyet") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          Chờ duyệt
        </span>
      );
    }
    if (status === "DaHuy") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        {status || "Không rõ"}
      </span>
    );
  };

  const filteredPhieuNhaps = phieuNhaps.filter((item: PhieuNhapResponse) => {
    const query = phieuNhapSearch.trim().toLowerCase();
    if (!query) return true;
    return [
      item.maPn?.toString(),
      item.tenCh,
      item.tenNcc,
      item.tenNv,
      item.trangThai,
    ]
      .filter(Boolean)
      .some((value) => value!.toString().toLowerCase().includes(query));
  });

  const totalStockOnPage = tonKhos.reduce(
    (acc: number, curr: any) => acc + (curr.tongSoLuong ?? curr.soLuong ?? 0),
    0,
  );

  const totalValueOnPage = phieuNhaps.reduce(
    (acc: number, item: PhieuNhapResponse) => acc + (item.tongTien ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full p-2 overflow-hidden">
      {/* Page Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản lý tồn kho
          </h1>
          {isStoreRole && tonKhos.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Cửa hàng:{" "}
              <span className="font-semibold text-gray-700">
                {(tonKhos[0] as any).tenCh}
              </span>
            </p>
          )}
        </div>
        {activeTab === "tong-quan" && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm">
              <FiDownload />
              Xuất Excel
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          onClick={() => setActiveTab("tong-quan")}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all ${
            activeTab === "tong-quan"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Tổng quan tồn kho
        </button>
        <button
          onClick={() => setActiveTab("phieu-nhap")}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all ${
            activeTab === "phieu-nhap"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Phiếu nhập hàng
        </button>
        <button
          onClick={() => setActiveTab("phieu-chuyen")}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all ${
            activeTab === "phieu-chuyen"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Phiếu chuyển kho
        </button>
      </div>

      {activeTab === "tong-quan" && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FiBox size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Tổng số biến thể
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {pageData?.totalElements || 0}
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <FiBox size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Tồn kho trang hiện tại
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {totalStockOnPage}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-4 items-end shrink-0">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm, SKU, barcode, màu sắc..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-64 md:w-80">
              <label className="text-xs font-medium text-gray-500">
                Sản phẩm
              </label>
              <ProductSelect
                selectedId={params.maSp}
                onChange={(maSp) =>
                  setParams((prev) => ({ ...prev, maSp, page: 0 }))
                }
              />
            </div>
          </div>

          {/* Main Table Area */}
          <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Ảnh
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap min-w-[200px]">
                      Tên sản phẩm
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      SKU
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Barcode
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Thuộc tính
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-right">
                      Giá bán
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-center">
                      {isStoreRole ? "Số lượng tồn" : "Tổng tồn kho"}
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <FiLoader className="animate-spin text-2xl text-blue-500 mx-auto" />
                        <div className="text-sm text-gray-500 mt-2">
                          Đang tải dữ liệu...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center text-red-500 font-medium"
                      >
                        Đã xảy ra lỗi khi tải dữ liệu!
                      </td>
                    </tr>
                  ) : tonKhos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Không tìm thấy biến thể nào trong kho
                      </td>
                    </tr>
                  ) : (
                    tonKhos.map((item: any) => (
                      <tr
                        key={item.maBienThe}
                        className={`border-b border-gray-100 transition-colors ${
                          role === "Admin"
                            ? "cursor-pointer hover:bg-blue-50/50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          if (role === "Admin") {
                            setSelectedMaBienThe(item.maBienThe);
                          }
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                            {item.anhSp ? (
                              <img
                                src={item.anhSp}
                                alt={item.tenSp}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-xs text-gray-400">Ảnh</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.tenSp}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Mã SP: {item.maSp}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          {item.barcode}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          <div className="flex flex-col gap-0.5">
                            {item.mauSac && (
                              <div>
                                <span className="text-gray-400">Màu:</span>{" "}
                                {item.mauSac}
                              </div>
                            )}
                            {item.dungLuong && (
                              <div>
                                <span className="text-gray-400">
                                  Dung lượng:
                                </span>{" "}
                                {item.dungLuong}
                              </div>
                            )}
                            {item.kichThuoc && (
                              <div>
                                <span className="text-gray-400">
                                  Kích thước:
                                </span>{" "}
                                {item.kichThuoc}
                              </div>
                            )}
                            {!item.mauSac &&
                              !item.dungLuong &&
                              !item.kichThuoc && <span>---</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatCurrency(item.giaBan)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900">
                          {item.soLuong ?? item.tongSoLuong ?? 0}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              (item.tongSoLuong ?? item.soLuong) > 5
                                ? "text-gray-800 bg-gray-100"
                                : (item.tongSoLuong ?? item.soLuong) > 0
                                  ? "text-yellow-800 bg-yellow-100"
                                  : "text-red-800 bg-red-100"
                            }`}
                          >
                            {item.tongSoLuong ?? item.soLuong}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {getStatusBadge(item.trangThaiBienThe)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && pageData && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto">
                <span className="text-sm text-gray-500">
                  Hiển thị{" "}
                  {pageData.totalElements === 0
                    ? 0
                    : pageData.page * pageData.size + 1}{" "}
                  đến{" "}
                  {Math.min(
                    (pageData.page + 1) * pageData.size,
                    pageData.totalElements,
                  )}{" "}
                  trong số {pageData.totalElements} mục
                </span>
                <div className="flex gap-1">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={pageData.page === 0}
                    onClick={() =>
                      setParams({ ...params, page: pageData.page - 1 })
                    }
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
                      Math.abs(idx - pageData.page) <= 1
                    ) {
                      return (
                        <button
                          key={idx}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            pageData.page === idx
                              ? "bg-blue-50 text-blue-600 border border-transparent"
                              : "text-gray-600 hover:bg-gray-50 border border-transparent"
                          }`}
                          onClick={() => setParams({ ...params, page: idx })}
                        >
                          {idx + 1}
                        </button>
                      );
                    } else if (Math.abs(idx - pageData.page) === 2) {
                      return (
                        <span key={idx} className="px-3 py-1 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={
                      pageData.page >=
                      Math.ceil(pageData.totalElements / pageData.size) - 1
                    }
                    onClick={() =>
                      setParams({ ...params, page: pageData.page + 1 })
                    }
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "phieu-nhap" && (
        <>
          <div className="flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Phiếu nhập hàng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý danh sách phiếu nhập hàng và theo dõi trạng thái duyệt.
              </p>
            </div>
            <div className="flex gap-3">
              {canCreatePhieuNhap && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                >
                  <FiPlus />
                  Tạo phiếu nhập
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm">
                <FiDownload />
                Xuất Excel
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FiFileText size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Tổng phiếu nhập
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {phieuNhapPageData?.totalElements || 0}
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <FiFileText size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm font-medium">
                  Tổng giá trị trang hiện tại
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalValueOnPage)}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-4 items-end shrink-0">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã, cửa hàng, nhà cung cấp, nhân viên..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={phieuNhapSearch}
                  onChange={(e) => setPhieuNhapSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Main Table Area */}
          <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Mã PN
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Ngày nhập
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Cửa hàng
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Nhà cung cấp
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">
                      Nhân viên
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-right">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isPhieuNhapLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <FiLoader className="animate-spin text-2xl text-blue-500 mx-auto" />
                        <div className="text-sm text-gray-500 mt-2">
                          Đang tải dữ liệu phiếu nhập...
                        </div>
                      </td>
                    </tr>
                  ) : isPhieuNhapError ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-red-500 font-medium"
                      >
                        Đã xảy ra lỗi khi tải dữ liệu phiếu nhập!
                      </td>
                    </tr>
                  ) : filteredPhieuNhaps.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Không tìm thấy phiếu nhập nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPhieuNhaps.map((item: PhieuNhapResponse) => (
                      <tr
                        key={item.maPn}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.maPn}
                        </td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                          {item.ngayNhap
                            ? new Date(item.ngayNhap).toLocaleDateString(
                                "vi-VN",
                              )
                            : "--"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.tenCh || "--"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.tenNcc || "--"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.tenNv || "--"}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatCurrency(item.tongTien ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {getPhieuNhapStatusBadge(item.trangThai || "")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isPhieuNhapLoading && phieuNhapPageData && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto">
                <span className="text-sm text-gray-500">
                  Hiển thị{" "}
                  {phieuNhapPageData.totalElements === 0
                    ? 0
                    : (phieuNhapPageData.page - 1) * phieuNhapPageData.size +
                      1}{" "}
                  đến{" "}
                  {Math.min(
                    phieuNhapPageData.page * phieuNhapPageData.size,
                    phieuNhapPageData.totalElements,
                  )}{" "}
                  trong số {phieuNhapPageData.totalElements} mục
                </span>
                <div className="flex gap-1">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={phieuNhapPageData.page === 1}
                    onClick={() =>
                      setPhieuNhapParams({
                        ...phieuNhapParams,
                        page: phieuNhapPageData.page - 1,
                      })
                    }
                  >
                    Trước
                  </button>
                  {Array.from({
                    length: Math.ceil(
                      phieuNhapPageData.totalElements / phieuNhapPageData.size,
                    ),
                  }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${phieuNhapPageData.page === idx + 1 ? "bg-blue-50 text-blue-600 border border-transparent" : "text-gray-600 hover:bg-gray-50 border border-transparent"}`}
                      onClick={() =>
                        setPhieuNhapParams({
                          ...phieuNhapParams,
                          page: idx + 1,
                        })
                      }
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={
                      phieuNhapPageData.page >=
                      Math.ceil(
                        phieuNhapPageData.totalElements /
                          phieuNhapPageData.size,
                      )
                    }
                    onClick={() =>
                      setPhieuNhapParams({
                        ...phieuNhapParams,
                        page: phieuNhapPageData.page + 1,
                      })
                    }
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "phieu-chuyen" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <FiTruck size={48} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Phiếu chuyển kho
          </h2>
          <p className="text-sm text-gray-500 max-w-md">
            Chức năng quản lý Phiếu chuyển kho giúp luân chuyển hàng hóa giữa
            các chi nhánh hoặc từ kho tổng về các cửa hàng đại lý. Tính năng này
            hiện đang được phát triển.
          </p>
        </div>
      )}

      {role === "Admin" && (
        <ChiTietBienTheModal
          isOpen={selectedMaBienThe !== null}
          onClose={() => setSelectedMaBienThe(null)}
          maBienThe={selectedMaBienThe}
        />
      )}

      <CreatePhieuNhapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setIsCreateModalOpen(false)}
        role={role}
        userStoreId={maCh}
        cuaHangs={cuaHangs}
        isCuaHangsLoading={isCuaHangsLoading}
      />
    </div>
  );
};

export default TonKhoPage;
