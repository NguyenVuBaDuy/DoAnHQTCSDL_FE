import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiDownload, FiPlus, FiSearch, FiFilter, FiMoreHorizontal, FiLoader, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import CategoryTree from "../components/CategoryTree";
import { sanPhamService } from "../../../services/sanPhamService";
import type { GetSanPhamParams, SanPham } from "../../../types/san-pham";

const SanPhamPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState<GetSanPhamParams>({
    page: 0,
    size: 10, // Default to 10 as per pagination UI
    search: "",
    trangThai: "",
    sort: ["maSp,desc"]
  });

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchValue) return prev;
        return { ...prev, search: searchValue, page: 0 };
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: response, isLoading } = useQuery({
    queryKey: ['san-pham', params],
    queryFn: () => sanPhamService.getSanPhams(params),
  });

  const sanPhams = response?.data?.content || [];
  const pageData = response?.data;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams({ ...params, trangThai: e.target.value, page: 0 });
  };

  return (
    <div className="fixed top-12 left-[220px] right-0 bottom-0 flex bg-[#F8F9FA] overflow-hidden z-30">
      {/* Left Sidebar - Category Tree */}
      <CategoryTree 
        selectedCategoryId={params.maDm}
        onSelectCategory={(maDm) => setParams({ ...params, maDm, page: 0 })}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 p-6 flex flex-col min-w-0 min-h-0 bg-transparent rounded-none overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Danh sách sản phẩm
            </h1>
            
            {/* Stats inline */}
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm h-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Tổng sản phẩm:</span>
                <span className="text-sm font-bold text-blue-600">{pageData?.totalElements || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
              <FiDownload />
              Xuất Excel
            </button>
            <button 
              onClick={() => navigate("/products/create")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              <FiPlus />
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-4 items-end shrink-0">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã sản phẩm, thương hiệu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 w-48">
            <label className="text-xs font-medium text-gray-500">Trạng thái</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              value={params.trangThai || ""}
              onChange={handleStatusChange}
            >
              <option value="">Tất cả</option>
              <option value="DangBan">Đang bán</option>
              <option value="NgungBan">Ngừng bán</option>
              <option value="HetHang">Hết hàng</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm h-10">
            <FiFilter />
            Lọc nâng cao
          </button>
        </div>

        {/* Main Table Area */}
        <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Ảnh</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap min-w-[250px]">Tên sản phẩm</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Danh mục</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Thương hiệu</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Biến thể</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap min-w-[130px]">Trạng thái</th>
                  <th className="px-6 py-4 font-medium text-center whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FiLoader className="animate-spin text-2xl text-blue-500 mx-auto" />
                      <div className="text-sm text-gray-500 mt-2">Đang tải dữ liệu...</div>
                    </td>
                  </tr>
                ) : sanPhams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  sanPhams.map((sp: SanPham) => (
                    <tr key={sp.maSp} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                          {sp.anh ? (
                            <img src={sp.anh} alt={sp.tenSp} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <span className="text-xs text-gray-400">Ảnh</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{sp.tenSp}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {sp.maSp}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{sp.category?.tenDm || '---'}</td>
                      <td className="px-6 py-4 text-gray-700">{sp.thuongHieu || '---'}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {sp.variantSummary?.activeVariants || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          sp.trangThai === 'DangBan' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : sp.trangThai === 'NgungBan' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {sp.trangThai === 'DangBan' 
                            ? 'Đang bán' 
                            : sp.trangThai === 'NgungBan' 
                              ? 'Ngừng bán' 
                              : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center relative action-dropdown-container">
                          <button 
                            className={`transition-colors p-1.5 rounded-md hover:bg-gray-100 ${openDropdownId === sp.maSp ? 'text-gray-700 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setOpenDropdownId(openDropdownId === sp.maSp ? null : sp.maSp)}
                          >
                            <FiMoreHorizontal size={18} />
                          </button>

                          {openDropdownId === sp.maSp && (
                            <div className="absolute right-8 top-0 w-36 bg-white rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                              <button 
                                className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                onClick={() => {
                                  navigate(`/products/detail/${sp.maSp}`);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <FiEye className="w-[16px] h-[16px] text-gray-500" />
                                Chi tiết
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                onClick={() => {
                                  navigate(`/products/edit/${sp.maSp}`);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <FiEdit className="w-[16px] h-[16px] text-gray-500" />
                                Chỉnh sửa
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button 
                                className="w-full text-left px-4 py-2 text-[13px] text-[#BA1A1A] hover:bg-red-50 flex items-center gap-2 transition-colors"
                                onClick={() => setOpenDropdownId(null)}
                              >
                                <FiTrash2 className="w-[16px] h-[16px] text-[#BA1A1A]" />
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
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
                Hiển thị {pageData.totalElements === 0 ? 0 : (pageData.page * pageData.size) + 1} đến {Math.min((pageData.page + 1) * pageData.size, pageData.totalElements)} trong số {pageData.totalElements} mục
              </span>
              <div className="flex gap-1">
                <button 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" 
                  disabled={pageData.page === 0}
                  onClick={() => setParams({ ...params, page: pageData.page - 1 })}
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.ceil(pageData.totalElements / pageData.size) }).map((_, idx) => {
                  if (
                    idx === 0 || 
                    idx === Math.ceil(pageData.totalElements / pageData.size) - 1 || 
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
                    return <span key={idx} className="px-3 py-1 text-gray-500">...</span>;
                  }
                  return null;
                })}
                
                <button 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={pageData.page >= Math.ceil(pageData.totalElements / pageData.size) - 1}
                  onClick={() => setParams({ ...params, page: pageData.page + 1 })}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SanPhamPage;
