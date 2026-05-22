import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiSearch, FiX, FiLoader } from "react-icons/fi";
import { sanPhamService } from "../../../services/sanPhamService";
import type { SanPham } from "../../../types/san-pham";

interface ProductSelectProps {
  selectedId?: number;
  onChange: (id?: number) => void;
}

export const ProductSelect = ({ selectedId, onChange }: ProductSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<SanPham[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SanPham | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch selected product detail when selectedId changes
  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProduct(null);
      return;
    }

    // Try finding in current list first
    const found = products.find((p) => p.maSp === selectedId);
    if (found) {
      setSelectedProduct(found);
      return;
    }

    // Otherwise, fetch from API
    const fetchSelectedDetail = async () => {
      try {
        const res = await sanPhamService.getSanPhamDetail(selectedId);
        if (res?.success && res.data) {
          setSelectedProduct(res.data);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      }
    };

    fetchSelectedDetail();
  }, [selectedId, products]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch products function
  const fetchProducts = async (
    pageToFetch: number,
    search: string,
    append = false,
  ) => {
    try {
      if (pageToFetch === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await sanPhamService.getSanPhams({
        page: pageToFetch,
        size: 10,
        search: search || undefined,
        trangThai: "DangBan", // Only search active products for inventory filtering
      });

      if (response?.success && response.data) {
        const newProducts = response.data.content || [];
        setTotalElements(response.data.totalElements || 0);

        if (append) {
          setProducts((prev) => {
            // Avoid duplicate ids
            const existingIds = new Set(prev.map((p) => p.maSp));
            const filteredNew = newProducts.filter(
              (p) => !existingIds.has(p.maSp),
            );
            return [...prev, ...filteredNew];
          });
        } else {
          setProducts(newProducts);
        }
      }
    } catch (err) {
      console.error("Error loading products for dropdown:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch page 0 when dropdown opens or search term changes
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(0);
      fetchProducts(0, debouncedSearch, false);
    }
  }, [isOpen, debouncedSearch]);

  // Handle scrolling of the dropdown list to trigger lazy loading
  const handleScroll = () => {
    const container = listRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // When scrolled near bottom
    if (scrollHeight - scrollTop - clientHeight < 20) {
      if (!isLoading && !isLoadingMore && products.length < totalElements) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, debouncedSearch, true);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSelectedProduct(null);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-left transition-all cursor-pointer shadow-sm select-none"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedProduct ? (
            <>
              {selectedProduct.anh ? (
                <img
                  src={selectedProduct.anh}
                  alt={selectedProduct.tenSp}
                  className="w-5 h-5 rounded object-cover shrink-0 border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-5 h-5 bg-gray-100 rounded border border-gray-200 shrink-0" />
              )}
              <span className="truncate text-gray-900 font-medium">
                {selectedProduct.tenSp}
              </span>
              <span className="text-[11px] text-gray-400 font-normal">
                (Ma SP: {selectedProduct.maSp})
              </span>
            </>
          ) : (
            <span className="text-gray-400">Chọn sản phẩm...</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedProduct && (
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <FiChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <FiSearch className="text-gray-400 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã SP..."
              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 p-0 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto max-h-60 custom-scrollbar"
          >
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                <FiLoader className="w-5 h-5 animate-spin text-blue-500" />
                <span>Đang tải sản phẩm...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              <>
                {products.map((product) => (
                  <div
                    key={product.maSp}
                    onClick={() => {
                      onChange(product.maSp);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-none ${
                      selectedId === product.maSp
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {product.anh ? (
                        <img
                          src={product.anh}
                          alt={product.tenSp}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">
                          SP
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-gray-900 font-medium leading-tight">
                        {product.tenSp}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        Mã SP: {product.maSp}{" "}
                        {product.thuongHieu ? `| ${product.thuongHieu}` : ""}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoadingMore && (
                  <div className="px-4 py-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 border-t border-gray-50">
                    <FiLoader className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>Đang tải thêm...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
