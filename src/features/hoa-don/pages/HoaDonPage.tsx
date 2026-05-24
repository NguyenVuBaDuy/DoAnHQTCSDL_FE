import { useState, useEffect, useDeferredValue } from "react";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiPercent,
  FiLoader,
  FiDollarSign,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
  FiAlertCircle
} from "react-icons/fi";
import { useAppSelector } from "../../../store";
import { tonKhoService } from "../../../services/tonKhoService";
import { cuaHangService } from "../../../services/cuaHangService";
import { khachHangService } from "../../../services/khachHangService";
import { voucherService } from "../../../services/voucherService";
import { hoaDonService } from "../../../services/hoaDonService";
import type { CuaHang } from "../../../types/cua-hang";
import type { KhachHang } from "../../../types/khach-hang";
import type { TonKhoCuaHang } from "../../../types/ton-kho";
import type { VoucherResponse } from "../../../services/voucherService";
import { CreateCustomerModal } from "../components/CreateCustomerModal";

interface CartItem {
  maBienThe: number;
  tenSp: string;
  sku: string;
  giaBan: number;
  soLuong: number;
  maxSoLuong: number;
  anhSp: string | null;
  mauSac: string | null;
  dungLuong: string | null;
  giamGia: number; // Manual line item discount
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const HoaDonPage = () => {
  // Auth state
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom || user?.nhanvien?.chucvu;
  const isAdmin = role === "Admin";
  const userStoreId = user?.mach || user?.nhanvien?.mach;

  // Stores selection
  const [stores, setStores] = useState<CuaHang[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Products stock
  const [products, setProducts] = useState<TonKhoCuaHang[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer search & select
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const deferredCustomerSearch = useDeferredValue(customerSearchTerm);
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<KhachHang | null>(null);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"TienMat" | "ChuyenKhoan">("TienMat");
  const [tienKhachDua, setTienKhachDua] = useState<number | "">("");

  // Modals / Statuses
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);

  // Fetch stores if Admin
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      try {
        const res = await cuaHangService.getCuaHangs();
        if (res.success && res.data) {
          setStores(res.data);
          // Set first store by default if Admin
          if (isAdmin && res.data.length > 0) {
            setSelectedStoreId(res.data[0].maCh);
          }
        }
      } catch (err) {
        console.error("Error loading stores:", err);
        toast.error("Không thể tải danh sách cửa hàng");
      } finally {
        setIsLoadingStores(false);
      }
    };

    if (isAdmin) {
      fetchStores();
    } else if (userStoreId) {
      setSelectedStoreId(userStoreId);
    }
  }, [isAdmin, userStoreId]);

  // Load products in store when store or search changes
  useEffect(() => {
    if (!selectedStoreId) return;

    const fetchStoreStock = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await tonKhoService.getTonKhoCuaHang(selectedStoreId, {
          search: deferredSearch || undefined,
          page,
          size: 9, // Fit grid perfectly
        });
        if (res.success && res.data) {
          setProducts(res.data.content || []);
          // Note: Backend PageResponse contains page details.
          // Since the page parameter is 0-based in backend, calculate totalPages
          const total = res.data.totalElements || 0;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / 9) || 1);
        }
      } catch (err) {
        console.error("Error loading store stock:", err);
        toast.error("Không thể tải tồn kho cửa hàng");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchStoreStock();
  }, [selectedStoreId, deferredSearch, page]);

  // Search customers
  useEffect(() => {
    if (!deferredCustomerSearch.trim()) {
      setCustomers([]);
      return;
    }

    const searchCustomers = async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await khachHangService.getKhachHangs({
          search: deferredCustomerSearch,
          page: 0,
          size: 5,
        });
        if (res.success && res.data) {
          setCustomers(res.data.content || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCustomers(false);
      }
    };

    searchCustomers();
  }, [deferredCustomerSearch]);

  // Reset page when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  // Clear cart if store changes
  const handleStoreChange = (storeId: number) => {
    if (cart.length > 0) {
      const confirmClear = window.confirm(
        "Thay đổi cửa hàng sẽ xóa toàn bộ sản phẩm hiện tại trong giỏ hàng. Bạn vẫn muốn tiếp tục?"
      );
      if (!confirmClear) return;
    }
    setSelectedStoreId(storeId);
    setCart([]);
    setAppliedVoucher(null);
    setVoucherCode("");
  };

  // Add item to cart
  const addToCart = (product: TonKhoCuaHang) => {
    if (product.soLuong <= 0) {
      toast.error("Sản phẩm đã hết hàng tại cửa hàng này!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.maBienThe === product.maBienThe);
      if (existing) {
        if (existing.soLuong >= product.soLuong) {
          toast.error(`Chỉ còn ${product.soLuong} sản phẩm trong kho!`);
          return prev;
        }
        return prev.map((item) =>
          item.maBienThe === product.maBienThe
            ? { ...item, soLuong: item.soLuong + 1 }
            : item
        );
      }

      toast.success(`Đã thêm ${product.tenSp} vào giỏ`);
      return [
        ...prev,
        {
          maBienThe: product.maBienThe,
          tenSp: product.tenSp,
          sku: product.sku,
          giaBan: product.giaBan,
          soLuong: 1,
          maxSoLuong: product.soLuong,
          anhSp: product.anhSp,
          mauSac: product.mauSac,
          dungLuong: product.dungLuong,
          giamGia: 0,
        },
      ];
    });
  };

  // Update item quantity in cart
  const updateCartQty = (maBienThe: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.maBienThe !== maBienThe) return item;
          const newQty = item.soLuong + delta;
          if (newQty <= 0) return null; // will be filtered out below
          if (newQty > item.maxSoLuong) {
            toast.error(`Vượt quá tồn kho có sẵn (${item.maxSoLuong})!`);
            return item;
          }
          return { ...item, soLuong: newQty };
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // Update manual line discount
  const updateCartLineDiscount = (maBienThe: number, discountAmount: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.maBienThe !== maBienThe) return item;
        // Limit discount to item total price
        const maxDiscount = item.giaBan * item.soLuong;
        const validDiscount = Math.max(0, Math.min(discountAmount, maxDiscount));
        return { ...item, giamGia: validDiscount };
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (maBienThe: number) => {
    setCart((prev) => prev.filter((item) => item.maBienThe !== maBienThe));
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  // Subtotal (before voucher discount)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.giaBan * item.soLuong, 0);

  // Line discounts total
  const lineDiscountsTotal = cart.reduce((sum, item) => sum + item.giamGia, 0);

  // Compute voucher discount
  const getVoucherDiscount = () => {
    if (!appliedVoucher) return 0;
    if (cartSubtotal < appliedVoucher.dieuKienToiThieu) return 0;

    if (appliedVoucher.loai === "PhanTram") {
      let discount = cartSubtotal * (appliedVoucher.giaTri / 100);
      if (appliedVoucher.giaTriToiDa && discount > appliedVoucher.giaTriToiDa) {
        discount = appliedVoucher.giaTriToiDa;
      }
      return discount;
    } else if (appliedVoucher.loai === "TienMat") {
      return appliedVoucher.giaTri;
    }
    return 0;
  };

  const voucherDiscount = getVoucherDiscount();
  const totalPayable = Math.max(0, cartSubtotal - voucherDiscount - lineDiscountsTotal);

  // Change computation
  const changeDue = typeof tienKhachDua === "number" ? Math.max(0, tienKhachDua - totalPayable) : 0;

  // Validate and apply voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const res = await voucherService.getVoucherByCode(voucherCode.trim());
      if (res.success && res.data) {
        const v = res.data;

        // Check active status
        if (v.trangThai !== "KichHoat") {
          toast.error("Voucher này đã bị vô hiệu hóa");
          return;
        }

        // Check quantity limit
        if (v.soLuongDaDung >= v.soLuong) {
          toast.error("Voucher đã hết số lượng sử dụng");
          return;
        }

        // Check dates
        const now = new Date();
        const start = new Date(v.ngayBatDau);
        const end = new Date(v.ngayHetHan);
        if (now < start) {
          toast.error("Voucher chưa đến thời hạn áp dụng");
          return;
        }
        if (now > end) {
          toast.error("Voucher đã hết hạn sử dụng");
          return;
        }

        // Check minimum condition
        if (cartSubtotal < v.dieuKienToiThieu) {
          toast.error(
            `Voucher yêu cầu đơn hàng tối thiểu ${formatCurrency(v.dieuKienToiThieu)}!`
          );
          return;
        }

        setAppliedVoucher(v);
        toast.success(`Đã áp dụng voucher: ${v.tenVoucher}`);
      } else {
        toast.error(res.message || "Không thể tìm thấy voucher");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Lỗi khi kiểm tra mã voucher";
      toast.error(errMsg);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Check if voucher condition is still satisfied
  useEffect(() => {
    if (appliedVoucher && cartSubtotal < appliedVoucher.dieuKienToiThieu) {
      toast.error(`Giỏ hàng thay đổi! Đã hủy voucher do không đủ điều kiện tối thiểu.`);
      setAppliedVoucher(null);
    }
  }, [cartSubtotal, appliedVoucher]);

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (paymentMethod === "TienMat" && tienKhachDua !== "" && tienKhachDua < totalPayable) {
      toast.error("Tiền khách đưa không đủ thanh toán!");
      return;
    }

    setIsCheckoutPending(true);
    try {
      const payload = {
        maCh: selectedStoreId,
        maKh: selectedCustomer?.maKh || undefined,
        maDcgh: undefined, // Direct checkout at store counter
        maVoucher: appliedVoucher?.maVoucher || undefined,
        phuongThucThanhToan: paymentMethod,
        loaiHd: "TaiQuay",
        chiTiet: cart.map((item) => ({
          maBienThe: item.maBienThe,
          soLuong: item.soLuong,
          giamGia: item.giamGia,
        })),
      };

      const res = await hoaDonService.createHoaDon(payload);
      if (res.success) {
        toast.success("Thanh toán hóa đơn thành công!");

        // Clean up state
        setCart([]);
        setAppliedVoucher(null);
        setVoucherCode("");
        setSelectedCustomer(null);
        setTienKhachDua("");

        // Refresh product stock list to get updated quantities
        setPage(0);
        const stockRes = await tonKhoService.getTonKhoCuaHang(selectedStoreId, {
          search: deferredSearch || undefined,
          page: 0,
          size: 9,
        });
        if (stockRes.success && stockRes.data) {
          setProducts(stockRes.data.content || []);
          const total = stockRes.data.totalElements || 0;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / 9) || 1);
        }
      } else {
        toast.error(res.message || "Giao dịch thanh toán thất bại!");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Có lỗi xảy ra khi tạo giao dịch thanh toán";
      toast.error(errMsg);
    } finally {
      setIsCheckoutPending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4 select-none">
      {/* POS Toolbar Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Màn Hình Bán Hàng (POS)</h1>
            <p className="text-xs text-gray-500 mt-0.5">Lập đơn và thanh toán trực tiếp tại quầy</p>
          </div>
        </div>

        {/* Store Selection */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 shrink-0">
                <FiBuilding className="text-gray-400" />
                Cửa hàng:
              </span>
              <select
                value={selectedStoreId}
                onChange={(e) => handleStoreChange(Number(e.target.value))}
                disabled={isLoadingStores}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {stores.map((ch) => (
                  <option key={ch.maCh} value={ch.maCh}>
                    {ch.tenCh}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Cửa hàng của bạn: #{selectedStoreId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        {/* Left Side: Product Selection Grid */}
        <div className="w-full lg:w-[60%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Products Search Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50 shrink-0">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FiSearch size={18} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm theo tên, SKU, barcode..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Product Items List Grid */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-gray-50/50">
            {isLoadingProducts ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-sm font-medium">Đang tải sản phẩm từ kho...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="p-4 bg-gray-100 rounded-full mb-3">
                  <FiAlertCircle size={28} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Tồn kho không khả dụng</span>
                <span className="text-xs text-gray-500 max-w-xs mt-1">
                  Không tìm thấy sản phẩm nào trong kho của cửa hàng này phù hợp với bộ lọc tìm kiếm.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((p) => {
                  const isOutOfStock = p.soLuong <= 0;
                  const itemInCart = cart.find((item) => item.maBienThe === p.maBienThe);
                  const remainingQty = p.soLuong - (itemInCart?.soLuong || 0);

                  return (
                    <div
                      key={p.maBienThe}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className={`relative p-3 border rounded-xl bg-white shadow-sm flex flex-col justify-between transition-all select-none group ${
                        isOutOfStock
                          ? "opacity-60 cursor-not-allowed border-gray-200"
                          : remainingQty <= 0
                            ? "border-blue-300 ring-2 ring-blue-50 cursor-pointer"
                            : "border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      {/* Badge quantity overlay */}
                      {itemInCart && (
                        <span className="absolute top-2 right-2 bg-blue-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-full z-10 shadow-sm animate-in scale-in duration-200">
                          {itemInCart.soLuong}
                        </span>
                      )}

                      <div className="space-y-2">
                        {/* Product Image */}
                        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                          {p.anhSp ? (
                            <img
                              src={p.anhSp}
                              alt={p.tenSp}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400 font-semibold uppercase">TechStore</span>
                          )}
                        </div>

                        {/* Title & SKU */}
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[40px]">
                            {p.tenSp}
                          </h4>
                          <span className="text-[10px] text-gray-400 block font-medium mt-0.5">SKU: {p.sku}</span>
                        </div>

                        {/* Specs capacity / color */}
                        <div className="flex flex-wrap gap-1">
                          {p.mauSac && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              {p.mauSac}
                            </span>
                          )}
                          {p.dungLuong && (
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              {p.dungLuong}
                            </span>
                          )}
                          {p.kichThuoc && (
                            <span className="bg-purple-50 text-purple-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              {p.kichThuoc}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cost and Stock Status */}
                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-extrabold text-blue-600 text-sm">{formatCurrency(p.giaBan)}</span>
                        {isOutOfStock ? (
                          <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                            Hết kho
                          </span>
                        ) : remainingQty <= 0 ? (
                          <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                            Đã hết trong kho
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Kho: {p.soLuong}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Paging Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0 select-none">
              <span className="text-xs text-gray-500">
                Hiển thị <b>{products.length}</b> trên tổng số <b>{totalElements}</b> sản phẩm
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent text-gray-600"
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-gray-700 px-3">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent text-gray-600"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Checkout Summary & Action Panel */}
        <div className="w-full lg:w-[40%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-0">
          {/* Panel Title */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50 shrink-0">
            <FiShoppingBag className="text-blue-600" size={18} />
            <h3 className="font-bold text-gray-900 text-sm">Thông tin giỏ hàng ({cart.length})</h3>
          </div>

          {/* Cart items list (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center select-none">
                <div className="p-3 bg-gray-100 rounded-full">
                  <FiShoppingBag size={24} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Giỏ hàng rỗng</span>
                <span className="text-xs text-gray-500 max-w-[200px]">
                  Chọn sản phẩm từ danh sách bên trái để thêm vào đơn hàng.
                </span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.maBienThe} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-start gap-3">
                    {/* Item Image */}
                    <div className="w-12 h-12 bg-gray-100 border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {item.anhSp ? (
                        <img src={item.anhSp} alt={item.tenSp} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">SP</span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs truncate leading-snug">{item.tenSp}</h4>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[9px] text-gray-400">SKU: {item.sku}</span>
                        {item.mauSac && <span className="text-[9px] text-gray-500 bg-gray-100 px-1 rounded">{item.mauSac}</span>}
                        {item.dungLuong && <span className="text-[9px] text-blue-600 bg-blue-50 px-1 rounded">{item.dungLuong}</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-xs text-gray-900 block">
                        {formatCurrency(item.giaBan * item.soLuong)}
                      </span>
                      <span className="text-[10px] text-gray-400 block">{formatCurrency(item.giaBan)} / SP</span>
                    </div>
                  </div>

                  {/* Quantity & Manual Line Discount Actions */}
                  <div className="flex items-center justify-between pl-15">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shrink-0">
                      <button
                        onClick={() => updateCartQty(item.maBienThe, -1)}
                        className="px-2 py-1 hover:bg-gray-100 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="px-3 py-0.5 text-xs font-bold text-gray-800">{item.soLuong}</span>
                      <button
                        onClick={() => updateCartQty(item.maBienThe, 1)}
                        className="px-2 py-1 hover:bg-gray-100 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>

                    {/* Discount Input & Trash */}
                    <div className="flex items-center gap-3">
                      {/* Manual Line Discount */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-semibold">Giảm:</span>
                        <input
                          type="number"
                          value={item.giamGia || ""}
                          onChange={(e) => updateCartLineDiscount(item.maBienThe, Number(e.target.value))}
                          placeholder="VND"
                          className="w-20 px-1.5 py-0.5 border border-gray-300 rounded text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Trash */}
                      <button
                        onClick={() => removeFromCart(item.maBienThe)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Configuration Area (Fixed at bottom) */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
            {/* Customer Selection Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <FiUser /> Khách hàng
                </label>
                <button
                  onClick={() => setIsCreateCustomerOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <FiUserPlus /> Đăng ký thành viên
                </button>
              </div>

              <div className="relative">
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-2 border border-blue-200 bg-blue-50/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 text-blue-600 rounded-full">
                        <FiUser size={14} />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{selectedCustomer.hoTen}</span>
                        <span className="text-[11px] text-gray-500 block">SĐT: {selectedCustomer.sdt}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold px-2"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      placeholder="Tìm theo Số điện thoại hoặc Họ tên..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                    />

                    {/* Customer Dropdown Results */}
                    {showCustomerDropdown && (customerSearchTerm.trim() || isSearchingCustomers) && (
                      <div className="absolute bottom-full mb-1 left-0 right-0 max-h-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto">
                        {isSearchingCustomers ? (
                          <div className="p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                            <FiLoader className="w-3 animate-spin text-blue-500" />
                            <span>Đang tìm...</span>
                          </div>
                        ) : customers.length === 0 ? (
                          <div className="p-3 text-center text-xs text-gray-400">Không tìm thấy kết quả</div>
                        ) : (
                          customers.map((c) => (
                            <div
                              key={c.maKh}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomerSearchTerm("");
                                setShowCustomerDropdown(false);
                              }}
                              className="px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 last:border-none cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <span className="font-semibold block">{c.hoTen}</span>
                                <span className="text-[10px] text-gray-400">{c.sdt}</span>
                              </div>
                              <span className="text-[9px] text-gray-400">Mã KH: #{c.maKh}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Voucher Application Row */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                <FiPercent /> Khuyến mãi (Voucher)
              </label>

              {appliedVoucher ? (
                <div className="flex items-center justify-between p-2 border border-green-200 bg-green-50/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <FiPercent className="text-green-600" />
                    <div>
                      <span className="font-semibold text-green-800">
                        {appliedVoucher.maVoucher} - {appliedVoucher.tenVoucher}
                      </span>
                      <span className="text-[11px] text-green-600 block">
                        Đã giảm: {appliedVoucher.loai === "PhanTram" ? `${appliedVoucher.giaTri}%` : formatCurrency(appliedVoucher.giaTri)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAppliedVoucher(null)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold px-2"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="MÃ GIẢM GIÁ (VD: VIP10)..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={isValidatingVoucher || cart.length === 0}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {isValidatingVoucher ? <FiLoader className="animate-spin" /> : "Áp dụng"}
                  </button>
                </div>
              )}
            </div>

            {/* Payment & Cash Register Row */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <FiCreditCard /> Thanh toán
                </label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden shrink-0 bg-white">
                  <button
                    onClick={() => setPaymentMethod("TienMat")}
                    className={`flex-1 py-1.5 text-xs font-bold text-center transition-colors ${
                      paymentMethod === "TienMat" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Tiền mặt
                  </button>
                  <button
                    onClick={() => setPaymentMethod("ChuyenKhoan")}
                    className={`flex-1 py-1.5 text-xs font-bold text-center transition-colors ${
                      paymentMethod === "ChuyenKhoan" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Chuyển khoản
                  </button>
                </div>
              </div>

              {paymentMethod === "TienMat" ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <FiDollarSign /> Tiền khách đưa
                  </label>
                  <input
                    type="number"
                    value={tienKhachDua}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTienKhachDua(val === "" ? "" : Number(val));
                    }}
                    placeholder="VND..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                  <div className="p-2 border border-gray-200 bg-white rounded-lg text-[11px] text-gray-500 font-medium leading-tight">
                    Khách chuyển khoản bằng mã QR tài khoản ngân hàng cửa hàng.
                  </div>
                </div>
              )}
            </div>

            {/* Quick cash shortcut pills (only visible when paymentMethod === "TienMat") */}
            {paymentMethod === "TienMat" && totalPayable > 0 && (
              <div className="flex flex-wrap gap-1.5 select-none pt-1">
                {[
                  totalPayable,
                  50000,
                  100000,
                  200000,
                  500000
                ]
                  .filter((amount) => amount >= totalPayable)
                  // Avoid duplicates
                  .filter((v, i, self) => self.indexOf(v) === i)
                  .map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTienKhachDua(amount)}
                      className="px-2 py-0.5 border border-gray-300 rounded bg-white text-[10px] font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                    >
                      {amount === totalPayable ? "Đủ tiền" : formatCurrency(amount)}
                    </button>
                  ))}
              </div>
            )}

            {/* In-depth Billing breakdown */}
            <div className="border-t border-gray-200 pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Tổng tiền hàng:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              {lineDiscountsTotal > 0 && (
                <div className="flex items-center justify-between text-xs text-orange-600">
                  <span>Chiết khấu sản phẩm:</span>
                  <span className="font-semibold">- {formatCurrency(lineDiscountsTotal)}</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span>Voucher giảm giá:</span>
                  <span className="font-semibold">- {formatCurrency(voucherDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm pt-1 border-t border-dashed border-gray-200">
                <span className="font-bold text-gray-900">TỔNG CẦN THANH TOÁN:</span>
                <span className="font-extrabold text-blue-600 text-base">{formatCurrency(totalPayable)}</span>
              </div>

              {/* Show change output only when using cash */}
              {paymentMethod === "TienMat" && typeof tienKhachDua === "number" && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-gray-600">Tiền thừa thối khách:</span>
                  <span className="font-bold text-green-600">{formatCurrency(changeDue)}</span>
                </div>
              )}
            </div>

            {/* Complete checkout button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckoutPending || cart.length === 0 || (paymentMethod === "TienMat" && tienKhachDua !== "" && tienKhachDua < totalPayable)}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 select-none"
            >
              {isCheckoutPending ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>ĐANG GIAO DỊCH...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle size={16} />
                  <span>XÁC NHẬN THANH TOÁN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Quick Registration Modal */}
      <CreateCustomerModal
        isOpen={isCreateCustomerOpen}
        onClose={() => setIsCreateCustomerOpen(false)}
        onSuccess={(customer) => setSelectedCustomer(customer)}
      />
    </div>
  );
};

export default HoaDonPage;
