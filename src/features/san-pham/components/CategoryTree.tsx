import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiChevronDown, FiChevronRight, FiGrid, FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiHome, FiLoader, FiAlertCircle } from "react-icons/fi";
import { danhMucService } from "../../../services/danhMucService";
import type { DanhMuc } from "../../../types/danh-muc";

const iconMap: Record<number, React.ElementType> = {
  1: FiSmartphone,
  2: FiHeadphones,
  3: FiMonitor,
  4: FiHome,
  5: FiWatch,
};

interface CategoryTreeProps {
  selectedCategoryId?: number;
  onSelectCategory: (maDm: number | undefined) => void;
}

const CategoryTree = ({ selectedCategoryId, onSelectCategory }: CategoryTreeProps) => {
  const [expanded, setExpanded] = useState<number[]>([]);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => danhMucService.getCategoryTree(),
  });

  const categories = response?.data || [];

  const toggleExpand = (key: number) => {
    setExpanded(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full min-h-0 overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
          Cấu trúc danh mục
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
        {/* All Products */}
        <button 
          onClick={() => onSelectCategory(undefined)}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            selectedCategoryId === undefined
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FiGrid className="text-lg" />
          <span>Tất cả sản phẩm</span>
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-4 text-gray-500">
            <FiLoader className="animate-spin text-xl" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-4 text-red-500 gap-2">
            <FiAlertCircle />
            <span className="text-sm">Lỗi tải danh mục</span>
          </div>
        )}

        {!isLoading && !isError && categories.map((category: DanhMuc) => {
          const Icon = iconMap[category.maDm] || FiGrid;
          const isExpanded = expanded.includes(category.maDm);
          const hasChildren = category.children && category.children.length > 0;

          return (
            <div key={category.maDm} className="flex flex-col">
              <button 
                onClick={() => {
                  onSelectCategory(category.maDm);
                  if (hasChildren) {
                    toggleExpand(category.maDm);
                  }
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategoryId === category.maDm
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="text-lg text-gray-500" />
                <span className="flex-1 text-left">{category.tenDm}</span>
                {hasChildren && (
                  isExpanded ? <FiChevronDown className="text-gray-400" /> : <FiChevronRight className="text-gray-400" />
                )}
              </button>
              
              {hasChildren && isExpanded && (
                <div className="flex flex-col pl-9 pr-2 py-1 gap-1">
                  {category.children!.map((child) => (
                    <button 
                      key={child.maDm}
                      onClick={() => onSelectCategory(child.maDm)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCategoryId === child.maDm
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {child.tenDm}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTree;
