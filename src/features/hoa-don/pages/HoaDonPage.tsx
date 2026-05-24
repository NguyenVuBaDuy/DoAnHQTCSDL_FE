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
  FiAlertCircle,
  FiGrid,
  FiSmartphone,
  FiMonitor,
  FiHeadphones,
  FiWatch,
  FiHome
} from "react-icons/fi";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { useAppSelector } from "../../../store";
import { tonKhoService } from "../../../services/tonKhoService";
import { cuaHangService } from "../../../services/cuaHangService";
import { khachHangService } from "../../../services/khachHangService";
import { voucherService } from "../../../services/voucherService";
import { hoaDonService } from "../../../services/hoaDonService";
import { danhMucService } from "../../../services/danhMucService";
import { sanPhamService } from "../../../services/sanPhamService";
import type { CuaHang } from "../../../types/cua-hang";
import type { KhachHang } from "../../../types/khach-hang";
import type { DanhMuc } from "../../../types/danh-muc";
import type { SanPham, SanPhamVariant } from "../../../types/san-pham";
import type { VoucherResponse } from "../../../services/voucherService";
import { CreateCustomerModal } from "../components/CreateCustomerModal";
import { VariantSelectModal } from "../components/VariantSelectModal";
import { InvoiceList } from "../components/InvoiceList";

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

const iconMap: Record<number, React.ElementType> = {
  1: FiSmartphone,
  2: FiHeadphones,
  3: FiMonitor,
  4: FiHome,
  5: FiWatch,
};

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
  const userStoreId = user?.nhanvien?.mach;
  const [activeTab, setActiveTab] = useState<"pos" | "list">("pos");

  // Stores selection
  const [stores, setStores] = useState<CuaHang[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Store's active stock map (variantId -> quantity)
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [productStockMap, setProductStockMap] = useState<Record<number, number>>({});

  // Categories sidebar list
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Products grid list
  const [products, setProducts] = useState<SanPham[]>([]);
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
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<SanPham | null>(null);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);

  // Fetch stores & categories
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

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await danhMucService.getCategoryTree();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Error loading categories tree:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isAdmin) {
      fetchStores();
    } else if (userStoreId) {
      setSelectedStoreId(userStoreId);
    }
    fetchCategories();
  }, [isAdmin, userStoreId]);

  // Load stock map of selected store (Fetch size: 500 to catch everything)
  const fetchStoreStockMap = async (storeId: number) => {
    try {
      const res = await tonKhoService.getTonKhoCuaHang(storeId, {
        page: 0,
        size: 500,
      });
      if (res.success && res.data) {
        const map: Record<number, number> = {};
        const prodStockMap: Record<number, number> = {};
        const content = res.data.content || [];
        content.forEach((item) => {
          map[item.maBienThe] = item.soLuong;
          if (item.maSp) {
            prodStockMap[item.maSp] = (prodStockMap[item.maSp] || 0) + item.soLuong;
          }
        });
        setStockMap(map);
        setProductStockMap(prodStockMap);
      }
    } catch (err) {
      console.error("Error loading stock levels:", err);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      fetchStoreStockMap(selectedStoreId);
    }
  }, [selectedStoreId]);

  // Fetch unique products based on Search, Category, Paging
  useEffect(() => {
    const fetchProductsData = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await sanPhamService.getSanPhams({
          search: deferredSearch || undefined,
          maDm: selectedCategoryId,
          page,
          size: 6, // 2 columns x 3 rows is visually perfect
          trangThai: "DangBan",
        });
        if (res.success && res.data) {
          setProducts(res.data.content || []);
          const total = res.data.totalElements || 0;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / 6) || 1);
        }
      } catch (err) {
        console.error("Error loading products catalog:", err);
        toast.error("Không thể tải danh mục sản phẩm");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProductsData();
  }, [deferredSearch, selectedCategoryId, page]);

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

  // Reset page when search or category changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedCategoryId]);

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

  // Add a specific variant to cart
  const handleAddVariantToCart = (product: SanPham, variant: SanPhamVariant, maxStock: number) => {
    const existing = cart.find((item) => item.maBienThe === variant.maBienThe);
    
    if (existing) {
      if (existing.soLuong >= maxStock) {
        toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
        return;
      }
      
      setCart((prev) =>
        prev.map((item) =>
          item.maBienThe === variant.maBienThe
            ? { ...item, soLuong: item.soLuong + 1 }
            : item
        )
      );
    } else {
      toast.success(`Đã thêm ${product.tenSp} (${variant.sku}) vào giỏ`);
      const details = [variant.mauSac, variant.dungLuong].filter(Boolean).join(" - ");
      const displayTitle = details ? `${product.tenSp} (${details})` : product.tenSp;

      setCart((prev) => [
        ...prev,
        {
          maBienThe: variant.maBienThe,
          tenSp: displayTitle,
          sku: variant.sku,
          giaBan: variant.giaBan,
          soLuong: 1,
          maxSoLuong: maxStock,
          anhSp: product.anh,
          mauSac: variant.mauSac,
          dungLuong: variant.dungLuong,
          giamGia: 0,
        },
      ]);
    }
  };

  // Click on a product from catalog
  const handleProductClick = async (product: SanPham) => {
    const totalProductStock = productStockMap[product.maSp] || 0;

    if (totalProductStock <= 0) {
      toast.error("Sản phẩm đã hết hàng tại cửa hàng này!");
      return;
    }

    const loadToast = toast.loading("Đang tải thông tin phiên bản...");
    try {
      const res = await sanPhamService.getSanPhamDetail(product.maSp);
      toast.dismiss(loadToast);
      if (res.success && res.data) {
        const detailedProduct = res.data;
        const productVariants = detailedProduct.variants || [];

        if (productVariants.length === 1) {
          // Shortcut: directly add the only variant if only 1 exists
          const soleVariant = productVariants[0];
          const stock = stockMap[soleVariant.maBienThe] || 0;
          handleAddVariantToCart(detailedProduct, soleVariant, stock);
        } else {
          // Multiple options: open selection modal
          setSelectedProductForVariant(detailedProduct);
        }
      } else {
        toast.error("Không thể tải chi tiết sản phẩm");
      }
    } catch (err) {
      toast.dismiss(loadToast);
      console.error("Error loading product variants:", err);
      toast.error("Có lỗi xảy ra khi tải phiên bản sản phẩm");
    }
  };

  // Update item quantity in cart
  const updateCartQty = (maBienThe: number, delta: number) => {
    const item = cart.find((i) => i.maBienThe === maBienThe);
    if (!item) return;

    const newQty = item.soLuong + delta;
    if (newQty > item.maxSoLuong) {
      toast.error(`Vượt quá tồn kho có sẵn (${item.maxSoLuong})!`);
      return;
    }

    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.maBienThe !== maBienThe));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.maBienThe === maBienThe ? { ...i, soLuong: newQty } : i
        )
      );
    }
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
        // Refresh stock maps reactively
        fetchStoreStockMap(selectedStoreId);
        setPage(0);
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
      {/* POS & Invoice Management Header Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Quản Lý Hóa Đơn</h1>
              <p className="text-xs text-gray-500 mt-0.5">Lập hóa đơn bán lẻ tại quầy và quản lý danh sách giao dịch</p>
            </div>
          </div>

          {/* Premium Switcher Tabs */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-0.5">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === "pos"
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200/40"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Lập hóa đơn (POS)
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === "list"
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200/40"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Danh sách hóa đơn
            </button>
          </div>
        </div>

        {/* Store Selection (POS tab only) */}
        {activeTab === "pos" && (
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 shrink-0">
                  <HiOutlineBuildingStorefront className="text-gray-400" />
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
        )}
      </div>

      {activeTab === "pos" ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
          {/* Left Side: Category Sidebar & Product Catalog Grid */}
          <div className="w-full lg:w-[70%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
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
                  placeholder="Tìm sản phẩm theo tên, thương hiệu..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Catalog panel: Split into Category Sidebar & Product Grid */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* 1. Category Tree Sidebar (Left part of catalog) */}
              <div className="w-48 border-r border-gray-100 flex flex-col h-full bg-white select-none shrink-0 overflow-y-auto">
                <div className="p-3 border-b border-gray-50 flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <FiGrid /> Danh mục
                </div>
                <div className="p-2 space-y-1">
                  {/* All products button */}
                  <button
                    onClick={() => setSelectedCategoryId(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedCategoryId === undefined
                        ? "bg-blue-50 text-blue-600 font-extrabold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <FiGrid size={14} className="opacity-70" />
                    <span>Tất cả</span>
                  </button>

                  {isLoadingCategories ? (
                    <div className="flex justify-center p-4">
                      <FiLoader className="animate-spin text-blue-500" size={14} />
                    </div>
                  ) : (
                    categories.map((c) => {
                      const Icon = iconMap[c.maDm] || FiGrid;
                      return (
                        <div key={c.maDm} className="space-y-1">
                          <button
                            onClick={() => setSelectedCategoryId(c.maDm)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                              selectedCategoryId === c.maDm
                                ? "bg-blue-50 text-blue-600 font-extrabold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon size={14} className="opacity-70" />
                              <span className="truncate">{c.tenDm}</span>
                            </span>
                          </button>

                          {/* Child Subcategories */}
                          {c.children && c.children.length > 0 && (
                            <div className="pl-6 space-y-0.5 border-l border-gray-100 ml-4 py-0.5">
                              {c.children.map((child) => (
                                <button
                                  key={child.maDm}
                                  onClick={() => setSelectedCategoryId(child.maDm)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-semibold block transition-all ${
                                    selectedCategoryId === child.maDm
                                      ? "bg-blue-50 text-blue-600 font-bold"
                                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                  }`}
                                >
                                  {child.tenDm}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. Product Catalog Grid (Right part of catalog) */}
              <div className="flex-1 flex flex-col h-full bg-gray-50/50 min-w-0">
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                  {isLoadingProducts ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Đang tải sản phẩm...</span>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                      <div className="p-4 bg-gray-100 rounded-full mb-3">
                        <FiAlertCircle size={28} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Không tìm thấy sản phẩm</span>
                      <span className="text-xs text-gray-500 max-w-xs mt-1">
                        Không có sản phẩm nào thuộc bộ lọc này hiện đang bán.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {products.map((p) => {
                        // Calculate total store stock of this product's variants
                        const totalStock = productStockMap[p.maSp] || 0;

                        const isOutOfStock = totalStock <= 0;
                        const hasMultipleVariants = (p.variantSummary?.totalVariants || 0) > 1;

                        // Price range
                        const minPrice = p.variantSummary?.minGiaBan || 0;
                        const maxPrice = p.variantSummary?.maxGiaBan || 0;
                        const priceString = minPrice === maxPrice 
                          ? formatCurrency(minPrice) 
                          : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

                        return (
                          <div
                            key={p.maSp}
                            onClick={() => handleProductClick(p)}
                            className={`relative p-3 border rounded-xl bg-white shadow-sm flex flex-col justify-between transition-all select-none group ${
                              isOutOfStock
                                ? "opacity-60 cursor-not-allowed border-gray-200"
                                : "border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer"
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Product Image */}
                              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                                {p.anh ? (
                                  <img
                                    src={p.anh}
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

                              {/* Title & Brand */}
                              <div>
                                <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 min-h-[36px]">
                                  {p.tenSp}
                                </h4>
                                <span className="text-[10px] text-gray-400 block font-medium mt-0.5">Hiệu: {p.thuongHieu}</span>
                              </div>
                            </div>

                            {/* Cost and Stock Status */}
                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-end justify-between">
                              <div>
                                <span className="text-[9px] text-gray-400 block font-bold">GIÁ BÁN</span>
                                <span className="font-extrabold text-blue-600 text-[11px] leading-tight block">
                                  {priceString}
                                </span>
                              </div>
                              
                              <div className="text-right">
                                {isOutOfStock ? (
                                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                    Hết kho
                                  </span>
                                ) : (
                                  <div className="space-y-0.5">
                                    {hasMultipleVariants && (
                                      <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded block text-center">
                                        {p.variantSummary?.totalVariants} Phiên bản
                                      </span>
                                    )}
                                    <span className="text-[9px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded block text-center">
                                      Tồn: {totalStock}
                                    </span>
                                  </div>
                                )}
                              </div>
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
                      Hiển thị <b>{products.length}</b> trên <b>{totalElements}</b> sản phẩm
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
            </div>
          </div>

          {/* Right Side: Checkout Summary & Action Panel */}
          <div className="w-full lg:w-[30%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-0">
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
                    Chọn sản phẩm từ danh mục bên trái để thêm vào đơn hàng.
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
                        <h4 className="font-bold text-gray-900 text-xs leading-snug">{item.tenSp}</h4>
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
      ) : (
        <div className="flex-1 overflow-hidden min-h-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <InvoiceList />
        </div>
      )}

      {/* Product Variant Selection Modal */}
      <VariantSelectModal
        isOpen={selectedProductForVariant !== null}
        onClose={() => setSelectedProductForVariant(null)}
        product={selectedProductForVariant}
        stockMap={stockMap}
        onSelectVariant={(variant, maxStock) => {
          if (selectedProductForVariant) {
            handleAddVariantToCart(selectedProductForVariant, variant, maxStock);
          }
        }}
      />

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
