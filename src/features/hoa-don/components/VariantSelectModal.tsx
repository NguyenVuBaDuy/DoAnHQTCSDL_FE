import { FiX, FiCheck, FiInfo } from "react-icons/fi";
import type { SanPham } from "../../../types/san-pham";

interface VariantSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SanPham | null;
  stockMap: Record<number, number>; // variantId -> quantity
  onSelectVariant: (variant: any, maxStock: number) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const VariantSelectModal = ({
  isOpen,
  onClose,
  product,
  stockMap,
  onSelectVariant,
}: VariantSelectModalProps) => {
  if (!isOpen || !product) return null;

  const variants = product.variants || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white flex items-center justify-center">
              {product.anh ? (
                <img src={product.anh} alt={product.tenSp} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-gray-400 font-bold uppercase">SP</span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{product.tenSp}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Thương hiệu: {product.thuongHieu} | Vui lòng chọn phiên bản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Variants list (Scrollable) */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3 bg-gray-50/50">
          {variants.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
              <FiInfo size={20} className="text-gray-300" />
              <span>Sản phẩm này không có phiên bản biến thể nào khả dụng.</span>
            </div>
          ) : (
            variants.map((v) => {
              const stock = stockMap[v.maBienThe] || 0;
              const isOutOfStock = stock <= 0;

              return (
                <div
                  key={v.maBienThe}
                  onClick={() => {
                    if (!isOutOfStock) {
                      onSelectVariant(v, stock);
                      onClose();
                    }
                  }}
                  className={`p-3.5 border rounded-xl bg-white shadow-sm flex items-center justify-between transition-all select-none ${
                    isOutOfStock
                      ? "opacity-60 cursor-not-allowed border-gray-200"
                      : "border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer hover:bg-blue-50/10 group"
                  }`}
                >
                  <div className="space-y-1">
                    {/* Sku & specs */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {v.sku}
                      </span>
                      {v.mauSac && (
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {v.mauSac}
                        </span>
                      )}
                      {v.dungLuong && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {v.dungLuong}
                        </span>
                      )}
                      {v.kichThuoc && (
                        <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {v.kichThuoc}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 block">Barcode: {v.barcode}</span>
                  </div>

                  {/* Stock and Price details */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-blue-600 block">{formatCurrency(v.giaBan)}</span>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          Hết hàng tại quầy
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          Tồn kho: {stock}
                        </span>
                      )}
                    </div>

                    {!isOutOfStock && (
                      <div className="w-8 h-8 rounded-full border border-blue-200 text-blue-600 flex items-center justify-center bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <FiCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
