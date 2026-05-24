import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiX,
  FiFileText,
  FiCalendar,
  FiUser,
  FiLoader,
  FiShoppingBag,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";
import { phieuNhapService } from "../../../services/phieuNhapService";
import { toast } from "react-hot-toast";

interface ChiTietPhieuNhapModalProps {
  isOpen: boolean;
  onClose: () => void;
  maPn: number | null;
  role?: string;
}

export const ChiTietPhieuNhapModal: React.FC<ChiTietPhieuNhapModalProps> = ({
  isOpen,
  onClose,
  maPn,
  role,
}) => {
  const queryClient = useQueryClient();

  // 1. Fetch Overview details
  const {
    data: phieuNhapResponse,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useQuery({
    queryKey: ["phieu-nhap-detail", maPn],
    queryFn: () => {
      if (!maPn) throw new Error("Mã phiếu nhập không hợp lệ");
      return phieuNhapService.getPhieuNhapById(maPn);
    },
    enabled: isOpen && !!maPn,
  });

  // 2. Fetch Product list details
  const {
    data: detailsResponse,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useQuery({
    queryKey: ["phieu-nhap-items", maPn],
    queryFn: () => {
      if (!maPn) throw new Error("Mã phiếu nhập không hợp lệ");
      return phieuNhapService.getChiTietPhieuNhap(maPn);
    },
    enabled: isOpen && !!maPn,
  });

  const phieuNhap = phieuNhapResponse?.data;
  const items = detailsResponse?.data || [];

  // 3. Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => phieuNhapService.cancelPhieuNhap(id),
    onSuccess: () => {
      toast.success(`Hủy thành công phiếu nhập #${maPn}!`);
      queryClient.invalidateQueries({ queryKey: ["phieu-nhaps"] });
      queryClient.invalidateQueries({ queryKey: ["phieu-nhap-detail", maPn] });
      queryClient.invalidateQueries({ queryKey: ["ton-kho-tong-quan"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Không thể hủy phiếu nhập!");
    },
  });

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: string) => {
    if (status === "DaDuyet" || status === "HoanThanh") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          Đã nhập hàng
        </span>
      );
    }
    if (status === "ChoDuyet") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
          Chờ duyệt
        </span>
      );
    }
    if (status === "DaHuy") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
        {status || "Không rõ"}
      </span>
    );
  };

  const handleCancelClick = () => {
    if (!maPn) return;
    if (window.confirm(`Bạn có chắc chắn muốn hủy phiếu nhập hàng #${maPn}? Hành động này không thể hoàn tác.`)) {
      cancelMutation.mutate(maPn);
    }
  };

  const totalQuantity = items.reduce((acc, dt) => acc + (dt.soLuong || 0), 0);
  const totalItemsCount = items.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 transform scale-100 transition-all duration-300 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Chi Tiết Phiếu Nhập Hàng #{maPn}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Xem thông tin tổng quan và danh sách sản phẩm nhập vào kho cửa hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {isOverviewLoading ? (
            <div className="py-20 text-center">
              <FiLoader className="animate-spin text-3xl text-blue-600 mx-auto" />
              <p className="text-sm text-gray-400 mt-2">Đang tải thông tin phiếu nhập...</p>
            </div>
          ) : isOverviewError || !phieuNhap ? (
            <div className="py-12 text-center text-red-500 font-medium space-y-2">
              <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p>Đã xảy ra lỗi khi tải thông tin chi tiết phiếu nhập!</p>
            </div>
          ) : (
            <>
              {/* Slip Metadata Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Store and Supplier Information */}
                <div className="md:col-span-2 bg-linear-to-br from-blue-50/40 via-indigo-50/10 to-transparent p-5 rounded-2xl border border-blue-100/50 flex flex-col justify-between gap-4 shadow-3xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-1">
                        CỬA HÀNG NHẬN
                      </span>
                      <h4 className="font-extrabold text-gray-800 text-sm">
                        {phieuNhap.tenCh || `Cửa hàng #${phieuNhap.maCh}`}
                      </h4>
                      <span className="text-xs text-gray-400 font-medium">
                        Mã CH: #{phieuNhap.maCh}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                        NHÀ CUNG CẤP
                      </span>
                      <h4 className="font-extrabold text-gray-800 text-sm">
                        {phieuNhap.tenNcc || "Không xác định"}
                      </h4>
                      {phieuNhap.maNcc && (
                        <span className="text-xs text-gray-400 font-medium">
                          Mã NCC: #{phieuNhap.maNcc}
                        </span>
                      )}
                    </div>
                  </div>

                  {phieuNhap.ghiChu && (
                    <div className="border-t border-gray-100 pt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        GHI CHÚ / LÝ DO
                      </span>
                      <p className="text-xs text-gray-600 font-medium mt-1 italic">
                        "{phieuNhap.ghiChu}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Status and Info Block */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-3xs flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                      Trạng thái phiếu
                    </span>
                    <div className="mt-1.5">{getStatusBadge(phieuNhap.trangThai)}</div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="shrink-0 text-gray-400" />
                      <span>
                        Ngày lập:{" "}
                        <strong className="text-gray-700">
                          {formatDateTime(phieuNhap.ngayNhap)}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUser className="shrink-0 text-gray-400" />
                      <span>
                        Lập bởi:{" "}
                        <strong className="text-gray-700">
                          {phieuNhap.tenNv || phieuNhap.maNv || "Hệ thống"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                  <FiFileText className="text-blue-500" />
                  Danh sách sản phẩm chi tiết ({items.length})
                </h4>

                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-3xs">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3">Mã Biến thể</th>
                        <th className="px-6 py-3">Tên sản phẩm</th>
                        <th className="px-6 py-3">SKU</th>
                        <th className="px-6 py-3">Thuộc tính</th>
                        <th className="px-6 py-3 text-right">Đơn giá</th>
                        <th className="px-6 py-3 text-center">Số lượng</th>
                        <th className="px-6 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                      {isDetailsLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <FiLoader className="animate-spin text-2xl text-blue-600 mx-auto" />
                            <p className="text-xs text-gray-400 mt-2">
                              Đang tải sản phẩm chi tiết...
                            </p>
                          </td>
                        </tr>
                      ) : isDetailsError ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                            Không thể tải danh sách sản phẩm của phiếu nhập.
                          </td>
                        </tr>
                      ) : items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                            Không có sản phẩm nào trong chi tiết phiếu nhập.
                          </td>
                        </tr>
                      ) : (
                        items.map((dt) => (
                          <tr key={dt.maBienThe} className="hover:bg-gray-50/30">
                            <td className="px-6 py-4 font-bold text-gray-500 text-xs">
                              #{dt.maBienThe}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {dt.tenSp || "Sản phẩm không rõ"}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">
                              {dt.sku || "---"}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              <div className="flex gap-2 flex-wrap">
                                {dt.mauSac && (
                                  <span>
                                    Màu: <strong>{dt.mauSac}</strong>
                                  </span>
                                )}
                                {dt.dungLuong && (
                                  <span>
                                    | Dung lượng: <strong>{dt.dungLuong}</strong>
                                  </span>
                                )}
                                {dt.kichThuoc && (
                                  <span>
                                    | Kích thước: <strong>{dt.kichThuoc}</strong>
                                  </span>
                                )}
                                {!dt.mauSac && !dt.dungLuong && !dt.kichThuoc && <span>---</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900 font-medium">
                              {formatCurrency(dt.donGia)}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-blue-600">
                              {dt.soLuong}
                            </td>
                            <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                              {formatCurrency(dt.thanhTien)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculations display */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-3xs shrink-0">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">Tổng số mặt hàng</span>
                  <span className="text-base font-bold text-gray-800">{totalItemsCount} mặt hàng</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">Tổng số lượng</span>
                  <span className="text-base font-bold text-gray-800">{totalQuantity} sản phẩm</span>
                </div>
                <div className="col-span-2 flex flex-col md:items-end justify-center">
                  <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">TỔNG GIÁ TRỊ PHIẾU NHẬP</span>
                  <span className="text-2xl font-extrabold text-blue-600">
                    {formatCurrency(phieuNhap.tongTien || 0)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-between items-center shrink-0">
          <div>
            {/* Show cancel option for Admin & store managers if slip is active / pending */}
            {phieuNhap?.trangThai === "ChoDuyet" && (role === "Admin" || role === "QuanLyCuaHang") && (
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={cancelMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200 disabled:opacity-50"
              >
                <FiTrash2 />
                {cancelMutation.isPending ? "Đang hủy..." : "Hủy phiếu nhập"}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-3xs transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
