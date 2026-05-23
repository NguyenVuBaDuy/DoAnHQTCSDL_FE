import { useQuery } from "@tanstack/react-query";
import { FiX, FiLoader, FiPackage, FiMapPin, FiTag } from "react-icons/fi";
import { tonKhoService } from "../../../services/tonKhoService";

interface ChiTietBienTheModalProps {
  isOpen: boolean;
  onClose: () => void;
  maBienThe: number | null;
}

export const ChiTietBienTheModal = ({
  isOpen,
  onClose,
  maBienThe,
}: ChiTietBienTheModalProps) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chi-tiet-bien-the", maBienThe],
    queryFn: () => tonKhoService.getChiTietBienThe(maBienThe!),
    enabled: isOpen && maBienThe !== null,
  });

  if (!isOpen) return null;

  const detail = response?.data;
  const stores = detail?.chiTietCuaHang || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    if (status === "DangBan") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm animate-pulse-subtle">
          Đang bán
        </span>
      );
    }
    if (status === "NgungBan") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm">
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 transform scale-100 transition-all duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiPackage size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Chi Tiết Tồn Kho Biến Thể
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Xem số lượng tồn kho thực tế của từng chi nhánh cửa hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Đóng"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FiLoader className="animate-spin text-3xl text-blue-600" />
              <p className="text-sm font-medium text-gray-500">
                Đang tải chi tiết tồn kho...
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-red-500 font-medium bg-red-50 rounded-xl border border-red-100 m-2">
              <p className="text-base">
                Không thể tải thông tin chi tiết biến thể!
              </p>
              <p className="text-xs text-red-400 mt-1">Vui lòng thử lại sau.</p>
            </div>
          ) : !detail ? (
            <div className="text-center py-16 text-gray-500 font-medium">
              Không tìm thấy thông tin của biến thể này.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Product Info Card */}
              <div className="bg-linear-to-br from-blue-50/40 via-indigo-50/10 to-transparent p-5 rounded-xl border border-blue-100/50 flex flex-col md:flex-row gap-5 items-start md:items-center">
                <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {stores[0]?.anhSp ? (
                    <img
                      src={stores[0].anhSp}
                      alt={detail.tenSp}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      Ảnh SP
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 rounded-md mb-2">
                    Mã biến thể: #{detail.maBienThe}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {detail.tenSp}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-1">
                      <FiTag className="text-gray-400" />
                      <span>
                        SKU:{" "}
                        <span className="font-mono font-semibold text-gray-800">
                          {detail.sku}
                        </span>
                      </span>
                    </div>
                    {detail.mauSac && (
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                        <span className="text-gray-400 font-normal">
                          Màu sắc:
                        </span>
                        <span className="text-gray-800 font-semibold">
                          {detail.mauSac}
                        </span>
                      </div>
                    )}
                    {detail.dungLuong && (
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                        <span className="text-gray-400 font-normal">
                          Dung lượng:
                        </span>
                        <span className="text-gray-800 font-semibold">
                          {detail.dungLuong}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center shrink-0 min-w-[140px]">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Tổng tồn kho
                  </span>
                  <span className="text-3xl font-extrabold text-blue-600 mt-1">
                    {detail.tongSoLuong}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 font-medium">
                    Sản phẩm trên toàn hệ thống
                  </span>
                </div>
              </div>

              {/* Stores stock breakdown list */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiMapPin className="text-blue-500" />
                  <span>Chi tiết hàng hóa tại từng cửa hàng chi nhánh</span>
                </h4>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Mã CH</th>
                        <th className="px-6 py-3 font-semibold">
                          Tên Cửa Hàng
                        </th>
                        <th className="px-6 py-3 font-semibold">Barcode</th>
                        <th className="px-6 py-3 font-semibold text-right">
                          Đơn Giá
                        </th>
                        <th className="px-6 py-3 font-semibold text-center">
                          Số Lượng Tồn
                        </th>
                        <th className="px-6 py-3 font-semibold text-center">
                          Trạng Thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {stores.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-gray-500 font-medium"
                          >
                            Chưa có thông tin tồn kho tại cửa hàng nào.
                          </td>
                        </tr>
                      ) : (
                        stores.map((store) => (
                          <tr
                            key={store.maCh}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-semibold text-gray-700 text-xs">
                              #{store.maCh}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">
                                {store.tenCh}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {store.barcode}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                              {formatCurrency(store.giaBan)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${
                                  store.soLuong > 5
                                    ? "text-green-800 bg-green-50 border border-green-200"
                                    : store.soLuong > 0
                                      ? "text-yellow-800 bg-yellow-50 border border-yellow-200"
                                      : "text-red-800 bg-red-50 border border-red-200"
                                }`}
                              >
                                {store.soLuong}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {getStatusBadge(store.trangThaiBienThe)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
