import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiX,
  FiShoppingBag,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiPercent,
  FiLoader,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import { hoaDonService } from "../../../services/hoaDonService";
import type { HoaDonResponse, ChiTietHoaDonResponse } from "../../../types/hoa-don";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: HoaDonResponse | null;
  onRefresh: () => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val || 0);
};

export const InvoiceDetailModal = ({
  isOpen,
  onClose,
  invoice,
  onRefresh,
}: InvoiceDetailModalProps) => {
  const [details, setDetails] = useState<ChiTietHoaDonResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const res = await hoaDonService.getChiTiet(invoice.maHd);
          if (res.success && res.data) {
            setDetails(res.data);
          } else {
            toast.error(res.message || "Không thể tải chi tiết sản phẩm hóa đơn");
          }
        } catch (err) {
          console.error("Error loading invoice details:", err);
          toast.error("Có lỗi xảy ra khi tải chi tiết hóa đơn");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    } else {
      setDetails([]);
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const handleUpdateStatus = async (status: string) => {
    const confirm = window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái hóa đơn sang "${status}"?`);
    if (!confirm) return;

    setIsActionPending(true);
    try {
      const res = await hoaDonService.updateStatus(invoice.maHd, status);
      if (res.success) {
        toast.success("Cập nhật trạng thái thành công!");
        onRefresh();
        onClose();
      } else {
        toast.error(res.message || "Không thể cập nhật trạng thái");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancelInvoice = async () => {
    const confirm = window.confirm(
      "Cảnh báo: Bạn có chắc chắn muốn HỦY hóa đơn này? Thao tác này sẽ hoàn trả số lượng sản phẩm vào kho và KHÔNG THỂ HOÀN TÁC."
    );
    if (!confirm) return;

    setIsActionPending(true);
    try {
      const res = await hoaDonService.cancelHoaDon(invoice.maHd);
      if (res.success) {
        toast.success("Hủy hóa đơn thành công và đã hoàn trả kho hàng!");
        onRefresh();
        onClose();
      } else {
        toast.error(res.message || "Không thể hủy hóa đơn");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi khi hủy hóa đơn");
    } finally {
      setIsActionPending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DaThanhToan":
      case "Paid":
        return (
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-bold text-xs border border-green-200">
            Đã thanh toán
          </span>
        );
      case "ChoThanhToan":
      case "Pending":
        return (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-bold text-xs border border-yellow-200">
            Chờ thanh toán
          </span>
        );
      case "Huy":
      case "DaHuy":
      case "Cancelled":
        return (
          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full font-bold text-xs border border-red-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-xs border border-blue-200">
            {status}
          </span>
        );
    }
  };

  const isCancelled = invoice.trangThai === "Huy" || invoice.trangThai === "DaHuy" || invoice.trangThai === "Cancelled";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Chi Tiết Hóa Đơn #{invoice.maHd}</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Cửa hàng: {invoice.tenCh || `#${invoice.maCh}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/90 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Block 1: Invoice General metadata */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCalendar /> Thông tin chung
              </h3>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày lập đơn:</span>
                  <span className="font-semibold">
                    {new Date(invoice.ngayLap).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Thu ngân:</span>
                  <span className="font-semibold">{invoice.tenNv || invoice.maNv || "Hệ thống"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại đơn:</span>
                  <span className="font-semibold">
                    {invoice.loaiHd === "TaiQuay" ? "Tại quầy (POS)" : "Giao hàng Online"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trạng thái:</span>
                  {getStatusBadge(invoice.trangThai)}
                </div>
              </div>
            </div>

            {/* Block 2: Customer details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiUser /> Khách hàng mua
              </h3>
              <div className="space-y-1.5 text-xs text-gray-700">
                {invoice.maKh ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Họ và tên:</span>
                      <span className="font-bold text-gray-900">{invoice.tenKh || "Không tên"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số điện thoại:</span>
                      <span className="font-semibold">{invoice.sdtKh || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mã KH:</span>
                      <span className="font-mono text-gray-500">#{invoice.maKh}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-4">Khách vãng lai mua tại quầy</div>
                )}
              </div>
            </div>

            {/* Block 3: Shipping or transaction detail */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiMapPin /> Giao nhận & Thanh toán
              </h3>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">PT Thanh toán:</span>
                  <span className="font-semibold text-blue-600">
                    {invoice.phuongThucThanhToan === "TienMat" ? "Tiền mặt" : "Chuyển khoản"}
                  </span>
                </div>
                {invoice.loaiHd === "Online" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Người nhận:</span>
                      <span className="font-semibold">{invoice.hoTenNguoiNhan || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SĐT nhận:</span>
                      <span className="font-semibold">{invoice.sdtNguoiNhan || "N/A"}</span>
                    </div>
                    <div className="flex justify-col gap-0.5 mt-1 border-t border-gray-200/60 pt-1">
                      <span className="text-gray-500 block">Địa chỉ nhận:</span>
                      <span className="font-medium text-gray-900 block leading-normal line-clamp-2">
                        {invoice.diaChiGiaoHang || "N/A"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-4">Nhận hàng tại quầy</div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized list of products */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <FiShoppingBag className="text-blue-600" /> Danh sách sản phẩm mua
            </h4>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs font-semibold">Đang tải sản phẩm hóa đơn...</span>
              </div>
            ) : details.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500 border border-dashed rounded-xl bg-gray-50/50">
                Không tìm thấy sản phẩm trong hóa đơn này.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3">Phân loại</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-center">SL</th>
                      <th className="p-3 text-right">Giảm giá</th>
                      <th className="p-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {details.map((item) => {
                      const specStrings = [item.mauSac, item.dungLuong, item.kichThuoc].filter(Boolean);
                      return (
                        <tr key={item.maBienThe} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-semibold text-gray-900 max-w-[250px]">
                            <div>{item.tenSp}</div>
                            <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                              SKU: {item.sku}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-600">
                            {specStrings.length > 0 ? (
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] inline-block font-semibold">
                                {specStrings.join(" - ")}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right text-gray-700 font-medium">
                            {formatCurrency(item.donGia)}
                          </td>
                          <td className="p-3 text-center text-gray-900 font-extrabold">{item.soLuong}</td>
                          <td className="p-3 text-right text-orange-600 font-semibold">
                            {item.giamGia > 0 ? `-${formatCurrency(item.giamGia)}` : "-"}
                          </td>
                          <td className="p-3 text-right text-gray-900 font-extrabold">
                            {formatCurrency(item.thanhTien)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Billing summary card */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <div className="w-full md:w-80 bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền hàng:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(invoice.tongTien + invoice.giaTriGiam - invoice.phiVanChuyen)}
                </span>
              </div>
              {invoice.giaTriGiam > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>
                    Giảm giá {invoice.maVoucher ? `(Voucher: ${invoice.maVoucher})` : "(Chiết khấu)"}:
                  </span>
                  <span className="font-semibold">- {formatCurrency(invoice.giaTriGiam)}</span>
                </div>
              )}
              {invoice.phiVanChuyen > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold">{formatCurrency(invoice.phiVanChuyen)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed border-gray-200 font-bold">
                <span className="text-gray-900">TỔNG TIỀN THANH TOÁN:</span>
                <span className="text-blue-600 text-base font-extrabold">
                  {formatCurrency(invoice.tongTien)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            {!isCancelled && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-semibold mr-1">Chuyển trạng thái nhanh:</span>
                {invoice.trangThai === "ChoThanhToan" && (
                  <button
                    onClick={() => handleUpdateStatus("DaThanhToan")}
                    disabled={isActionPending}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                  >
                    <FiCheckCircle size={14} /> XÁC NHẬN THANH TOÁN
                  </button>
                )}
                {/* Generic quick status list */}
                {invoice.trangThai !== "DaThanhToan" && invoice.trangThai !== "ChoThanhToan" && (
                  <select
                    disabled={isActionPending}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateStatus(e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>Chọn trạng thái...</option>
                    <option value="ChoThanhToan">Chờ thanh toán</option>
                    <option value="DaThanhToan">Đã thanh toán</option>
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isCancelled && (
              <button
                onClick={handleCancelInvoice}
                disabled={isActionPending}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-150 text-red-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                {isActionPending ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiTrash2 />
                )}
                <span>HỦY HÓA ĐƠN</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
