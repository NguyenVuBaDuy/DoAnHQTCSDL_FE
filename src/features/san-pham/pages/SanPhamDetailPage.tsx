import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiEdit,
  FiLoader,
  FiLayers,
  FiTag,
  FiDollarSign,
  FiActivity,
  FiGrid,
  FiFileText,
  FiSearch,
} from "react-icons/fi";
import { sanPhamService } from "../../../services/sanPhamService";

const SanPhamDetailPage = () => {
  const navigate = useNavigate();
  const { maSp } = useParams<{ maSp: string }>();
  const [variantSearch, setVariantSearch] = useState("");

  // Query Product Detail
  const { data: detailResponse, isLoading, isError } = useQuery({
    queryKey: ["san-pham-detail", maSp],
    queryFn: () => sanPhamService.getSanPhamDetail(Number(maSp)),
    enabled: !!maSp,
  });

  const product = detailResponse?.data;
  const variants = product?.variants || [];

  // Filter variants based on search term (SKU, color, capacity, size)
  const filteredVariants = variants.filter((v) => {
    const searchLower = variantSearch.toLowerCase().trim();
    if (!searchLower) return true;

    return (
      (v.sku && v.sku.toLowerCase().includes(searchLower)) ||
      (v.barcode && v.barcode.toLowerCase().includes(searchLower)) ||
      (v.mauSac && v.mauSac.toLowerCase().includes(searchLower)) ||
      (v.dungLuong && v.dungLuong.toLowerCase().includes(searchLower)) ||
      (v.kichThuoc && v.kichThuoc.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="fixed top-12 left-[220px] right-0 bottom-0 flex flex-col items-center justify-center bg-[#F8F9FA] z-30 font-sans">
        <FiLoader size={32} className="animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-gray-500">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="fixed top-12 left-[220px] right-0 bottom-0 flex flex-col items-center justify-center bg-[#F8F9FA] z-30 font-sans p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 max-w-md shadow-sm">
          <h3 className="text-base font-bold mb-1">Không thể tải thông tin sản phẩm</h3>
          <p className="text-xs text-red-500 mb-4">
            Đã có lỗi xảy ra hoặc sản phẩm không tồn tại trong hệ thống.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <FiArrowLeft size={14} /> Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="fixed top-12 left-[220px] right-0 bottom-0 flex flex-col bg-[#F8F9FA] overflow-hidden z-30 font-sans">
      {/* Page Header */}
      <div className="bg-white border-b border-[#C1C6D5]/60 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/products")}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            title="Quay lại"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span>Sản phẩm</span>
              <span>/</span>
              <span className="text-gray-600">Chi tiết sản phẩm</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-lg font-bold text-gray-900">
                Chi tiết sản phẩm
              </h1>
              <span className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">
                Mã SP: {product.maSp}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/products/edit/${product.maSp}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <FiEdit size={14} />
            Chỉnh sửa sản phẩm
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-6 pb-28 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (Main Info & Variants list) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: General Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FiFileText size={18} />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Thông tin cơ bản
                  </h2>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  product.trangThai === "DangBan" 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : product.trangThai === "NgungBan"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}>
                  {product.trangThai === "DangBan" 
                    ? "Đang bán" 
                    : product.trangThai === "NgungBan" 
                      ? "Ngừng bán" 
                      : "Hết hàng"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Tên sản phẩm
                  </span>
                  <span className="font-semibold text-gray-900">{product.tenSp}</span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Thương hiệu
                  </span>
                  <span className="font-semibold text-gray-900">{product.thuongHieu || "---"}</span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Danh mục sản phẩm
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                    {product.category?.tenDmCha && (
                      <>
                        <span className="text-gray-500">{product.category.tenDmCha}</span>
                        <span className="text-gray-400">/</span>
                      </>
                    )}
                    <span className="text-blue-600 font-semibold">{product.category?.tenDm || "---"}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Số lượng biến thể
                  </span>
                  <div className="flex gap-4">
                    <span className="text-gray-700">
                      Tổng số: <strong className="text-gray-900 font-semibold">{product.variantSummary?.totalVariants || 0}</strong>
                    </span>
                    <span className="text-green-700">
                      Đang bán: <strong className="text-green-700 font-semibold">{product.variantSummary?.activeVariants || 0}</strong>
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Mô tả sản phẩm
                  </span>
                  <div className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-1 whitespace-pre-line leading-relaxed text-xs">
                    {product.moTa || "Chưa có mô tả chi tiết cho sản phẩm này."}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Variants list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <FiLayers size={18} />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Danh sách biến thể ({filteredVariants.length})
                  </h2>
                </div>

                {/* Local search filter for variants */}
                <div className="relative w-full md:w-64">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm biến thể (màu, dung lượng, SKU...)"
                    value={variantSearch}
                    onChange={(e) => setVariantSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-white"
                  />
                </div>
              </div>

              {filteredVariants.length > 0 ? (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-bold">Phân loại</th>
                        <th className="px-4 py-3 font-bold font-mono">SKU / Barcode</th>
                        <th className="px-4 py-3 font-bold text-right">Giá nhập</th>
                        <th className="px-4 py-3 font-bold text-right">Giá bán</th>
                        <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVariants.map((v) => {
                        const attributes = [v.mauSac, v.dungLuong, v.kichThuoc]
                          .filter(Boolean)
                          .join(" - ");

                        return (
                          <tr key={v.maBienThe} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-gray-800 text-sm">
                                {attributes || "Mặc định"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-mono text-gray-600 font-medium">SKU: {v.sku}</div>
                              <div className="font-mono text-gray-400 mt-0.5">BC: {v.barcode}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-600">
                              {formatVND(v.giaNhap)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-blue-600">
                              {formatVND(v.giaBan)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                v.trangThai === "DangBan"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : v.trangThai === "NgungBan"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              }`}>
                                {v.trangThai === "DangBan" 
                                  ? "Đang bán" 
                                  : v.trangThai === "NgungBan" 
                                    ? "Ngừng bán" 
                                    : "Hết hàng"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                  {variantSearch ? "Không tìm thấy biến thể phù hợp" : "Sản phẩm này chưa có biến thể nào"}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Product Image, Pricing Statistics) */}
          <div className="space-y-6">
            
            {/* Card 3: Image */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <FiGrid className="text-blue-500" /> Hình ảnh đại diện
              </h2>
              
              <div className="flex items-center justify-center p-2 bg-gray-50 border border-gray-100 rounded-2xl aspect-square overflow-hidden shadow-inner">
                {product.anh ? (
                  <img
                    src={product.anh}
                    alt={product.tenSp}
                    className="max-h-full max-w-full object-contain rounded-xl hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5">
                    <FiGrid size={32} />
                    <span className="text-xs">Không có hình ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Price & Range Statistics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <FiActivity className="text-indigo-500" /> Thống kê giá bán
              </h2>
              
              <div className="space-y-4 text-xs">
                {/* Gia Ban stats */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold uppercase tracking-wider text-[10px]">
                    <FiDollarSign /> Giá bán sản phẩm
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[9px] font-bold uppercase">Thấp nhất</span>
                      <strong className="text-sm text-blue-600 font-bold">
                        {product.variantSummary?.minGiaBan ? formatVND(product.variantSummary.minGiaBan) : "---"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] font-bold uppercase">Cao nhất</span>
                      <strong className="text-sm text-blue-700 font-bold">
                        {product.variantSummary?.maxGiaBan ? formatVND(product.variantSummary.maxGiaBan) : "---"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Gia Nhap stats */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                    <FiTag /> Giá nhập sản phẩm
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[9px] font-bold uppercase">Thấp nhất</span>
                      <strong className="text-sm text-gray-700 font-bold">
                        {product.variantSummary?.minGiaNhap ? formatVND(product.variantSummary.minGiaNhap) : "---"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] font-bold uppercase">Cao nhất</span>
                      <strong className="text-sm text-gray-800 font-bold">
                        {product.variantSummary?.maxGiaNhap ? formatVND(product.variantSummary.maxGiaNhap) : "---"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SanPhamDetailPage;
