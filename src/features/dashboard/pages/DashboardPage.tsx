import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiAlertTriangle,
  FiCalendar,
  FiRefreshCw,
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiAward,
  FiChevronRight
} from "react-icons/fi";
import { useAppSelector } from "../../../store";
import { thongKeService } from "../../../services/thongKeService";
import { cuaHangService } from "../../../services/cuaHangService";
import type { CuaHang } from "../../../types/cua-hang";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const DashboardPage = () => {
  // Auth state
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.tennhom || user?.nhanvien?.chucvu;
  const isAdmin = role === "Admin";
  const userStoreId = user?.nhanvien?.mach;

  // Filter state
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");
  
  // Date ranges: default to last 30 days
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Set store context for manager/staff automatically
  useEffect(() => {
    if (!isAdmin && userStoreId) {
      setSelectedStoreId(userStoreId);
    }
  }, [isAdmin, userStoreId]);

  // Fetch stores list (Admin only)
  const { data: storesRes, isLoading: isStoresLoading } = useQuery({
    queryKey: ["dashboard-stores"],
    queryFn: () => cuaHangService.getCuaHangs(),
    enabled: isAdmin,
  });
  const storesList = storesRes?.data || [];
  const currentStore = storesList.find(st => st.maCh === selectedStoreId);

  // Stats Query 1: Overview metrics
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isRefetching: isOverviewRefetching,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["dashboard-overview", selectedStoreId, startDate, endDate],
    queryFn: () =>
      thongKeService.getTongQuan({
        maCh: selectedStoreId || undefined,
        startDate: startDate ? `${startDate}T00:00:00Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59Z` : undefined,
      }),
  });

  // Stats Query 2: Top Selling Products
  const {
    data: topProductsRes,
    isLoading: isTopLoading,
    isRefetching: isTopRefetching,
    refetch: refetchTop,
  } = useQuery({
    queryKey: ["dashboard-top-products", selectedStoreId, startDate, endDate],
    queryFn: () =>
      thongKeService.getTopSanPham({
        maCh: selectedStoreId || undefined,
        limit: 5,
        startDate: startDate ? `${startDate}T00:00:00Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59Z` : undefined,
      }),
  });

  // Stats Query 3: Category Revenue Share
  const {
    data: categoryRes,
    isLoading: isCategoryLoading,
    isRefetching: isCategoryRefetching,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: ["dashboard-category", selectedStoreId, startDate, endDate],
    queryFn: () =>
      thongKeService.getDoanhThuTheoDanhMuc({
        maCh: selectedStoreId || undefined,
        startDate: startDate ? `${startDate}T00:00:00Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59Z` : undefined,
      }),
  });

  // Stats Query 4: Revenue and Orders Over Time
  const {
    data: revenueRes,
    isLoading: isRevenueLoading,
    isRefetching: isRevenueRefetching,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ["dashboard-revenue", selectedStoreId, startDate, endDate, groupBy],
    queryFn: () =>
      thongKeService.getDoanhThu({
        maCh: selectedStoreId || undefined,
        startDate: startDate ? `${startDate}T00:00:00Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59Z` : undefined,
        groupBy,
      }),
  });

  // Stats Query 5: Store Comparison (Admin only)
  const {
    data: storeComparisonRes,
    isLoading: isStoreLoading,
    isRefetching: isStoreRefetching,
    refetch: refetchStore,
  } = useQuery({
    queryKey: ["dashboard-store-comparison"],
    queryFn: () => thongKeService.getDoanhThuTheoCuaHang(),
    enabled: isAdmin,
  });

  // Master refresh function
  const handleRefreshAll = () => {
    refetchOverview();
    refetchTop();
    refetchCategory();
    refetchRevenue();
    if (isAdmin) {
      refetchStore();
    }
  };

  const isGlobalLoading =
    isOverviewLoading ||
    isTopLoading ||
    isCategoryLoading ||
    isRevenueLoading ||
    (isAdmin && isStoreLoading);

  const isGlobalRefetching =
    isOverviewRefetching ||
    isTopRefetching ||
    isCategoryRefetching ||
    isRevenueRefetching ||
    (isAdmin && isStoreRefetching);

  // Preset date functions
  const handleSetDatePreset = (preset: "7days" | "30days" | "thisMonth") => {
    const today = new Date();
    if (preset === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "30days") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "thisMonth") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  };

  // -------------------- Prepared Chart Data --------------------

  // 1. Line Chart: Revenue and Orders over time
  const revenueHistory = revenueRes?.data || [];
  const lineChartData = {
    labels: revenueHistory.map((item) => {
      // Clean time presentation (e.g. 2026-05-24 -> 24/05)
      const parts = item.thoiGian.split("-");
      if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
      if (parts.length === 2) return `${parts[1]}/${parts[0]}`; // Month grouping
      return item.thoiGian;
    }),
    datasets: [
      {
        type: "line" as const,
        label: "Doanh thu (VND)",
        data: revenueHistory.map((item) => item.doanhThu),
        borderColor: "rgb(79, 70, 229)", // Indigo-600
        backgroundColor: "rgba(79, 70, 229, 0.05)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y-revenue",
      },
      {
        type: "bar" as const,
        label: "Số đơn hàng",
        data: revenueHistory.map((item) => item.soLuongDonHang),
        backgroundColor: "rgba(16, 185, 129, 0.25)", // Emerald-500
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1.5,
        borderRadius: 4,
        yAxisID: "y-orders",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { weight: "600" as const, size: 12 },
          boxWidth: 16,
        },
      },
      tooltip: {
        padding: 12,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleFont: { size: 13, weight: "700" as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.dataset.yAxisID === "y-revenue") {
              label += formatCurrency(context.raw);
            } else {
              label += `${context.raw} đơn`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: "500" as const, size: 11 }, color: "#64748B" },
      },
      "y-revenue": {
        type: "linear" as const,
        position: "left" as const,
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: {
          callback: (value: any) => {
            if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
            return value;
          },
          font: { weight: "500" as const, size: 11 },
          color: "#4F46E5",
        },
      },
      "y-orders": {
        type: "linear" as const,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: {
          font: { weight: "500" as const, size: 11 },
          color: "#10B981",
        },
      },
    },
  };

  // 2. Doughnut Chart: Category share
  const categoryShare = categoryRes?.data || [];
  const totalCatRevenue = categoryShare.reduce((sum, item) => sum + item.doanhThu, 0);

  const doughnutColors = [
    "rgba(79, 70, 229, 0.8)",  // Indigo
    "rgba(16, 185, 129, 0.8)", // Emerald
    "rgba(6, 182, 212, 0.8)",  // Cyan
    "rgba(245, 158, 11, 0.8)", // Amber
    "rgba(239, 68, 68, 0.8)",  // Rose
    "rgba(139, 92, 246, 0.8)", // Purple
  ];
  const doughnutHoverColors = [
    "rgb(79, 70, 229)",
    "rgb(16, 185, 129)",
    "rgb(6, 182, 212)",
    "rgb(245, 158, 11)",
    "rgb(239, 68, 68)",
    "rgb(139, 92, 246)",
  ];

  const doughnutChartData = {
    labels: categoryShare.map((item) => item.tenDm),
    datasets: [
      {
        data: categoryShare.map((item) => item.doanhThu),
        backgroundColor: doughnutColors.slice(0, categoryShare.length),
        hoverBackgroundColor: doughnutHoverColors.slice(0, categoryShare.length),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll render a custom detailed legend instead
      },
      tooltip: {
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const raw = context.raw;
            const percentage = totalCatRevenue > 0 ? ((raw / totalCatRevenue) * 100).toFixed(1) : "0";
            return ` ${context.label}: ${formatCurrency(raw)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "70%",
  };

  // 3. Bar Chart: Store comparison
  const storeComparison = storeComparisonRes?.data || [];
  const barChartData = {
    labels: storeComparison.map((item) => item.tenCh),
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: storeComparison.map((item) => item.doanhThu),
        backgroundColor: "rgba(79, 70, 229, 0.85)", // Indigo
        hoverBackgroundColor: "rgb(79, 70, 229)",
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        callbacks: {
          label: (context: any) => ` Doanh thu: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: {
          callback: (value: any) => `${(value / 1e6).toFixed(0)}M`,
          font: { weight: "500" as const, size: 10 },
        },
      },
    },
  };

  // -------------------- Render Metrics --------------------
  const stats = overviewRes?.data || {
    tongDoanhThu: 0,
    tongDonHang: 0,
    tongKhachHang: 0,
    tongSanPhamDaBan: 0,
    sanPhamSapHetHang: 0,
  };

  return (
    <div className="space-y-6">
      {/* -------------------- Top Command Panel -------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-600" />
            Tổng Quan Thống Kê
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAdmin
              ? selectedStoreId === 0
                ? "Dữ liệu hợp nhất toàn hệ thống các cửa hàng"
                : `Dữ liệu tại: ${currentStore?.tenCh || `Cửa hàng #${selectedStoreId}`}`
              : `Dữ liệu tại: ${user?.nhanvien?.tencuaheng || "Cửa hàng của tôi"}`}
          </p>
        </div>

        {/* Filters and controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Store Selector (Admin only) */}
          {isAdmin ? (
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(Number(e.target.value))}
              disabled={isStoresLoading}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
            >
              <option value={0}>🏢 Tất cả cửa hàng</option>
              {storesList.map((ch) => (
                <option key={ch.maCh} value={ch.maCh}>
                  🏪 {ch.tenCh}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              {user?.nhanvien?.tencuaheng || "Cửa hàng của tôi"}
            </div>
          )}

          {/* Quick Date Presets */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-100">
            <button
              onClick={() => handleSetDatePreset("7days")}
              className="px-2.5 py-1 text-[11px] font-bold rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
            >
              7 ngày
            </button>
            <button
              onClick={() => handleSetDatePreset("30days")}
              className="px-2.5 py-1 text-[11px] font-bold rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
            >
              30 ngày
            </button>
            <button
              onClick={() => handleSetDatePreset("thisMonth")}
              className="px-2.5 py-1 text-[11px] font-bold rounded-md text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
            >
              Tháng này
            </button>
          </div>

          {/* Date Picker Range */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <div className="flex items-center gap-1">
              <FiCalendar className="text-gray-400" size={12} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-gray-700 focus:outline-none border-none p-0 w-24"
              />
            </div>
            <span className="text-gray-300 text-xs">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-gray-700 focus:outline-none border-none p-0 w-24"
            />
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefreshAll}
            disabled={isGlobalRefetching}
            className={`p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-200 active:bg-gray-50 transition-all shadow-2xs ${
              isGlobalRefetching ? "opacity-70 cursor-not-allowed" : ""
            }`}
            title="Làm mới dữ liệu"
          >
            <FiRefreshCw
              className={isGlobalRefetching ? "animate-spin text-indigo-600" : ""}
              size={14}
            />
          </button>
        </div>
      </div>

      {/* -------------------- 1. Metrics Scorecard Grid -------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Doanh thu */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300 text-indigo-600">
            <FiDollarSign size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <FiDollarSign size={20} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Tổng doanh thu
            </span>
          </div>
          <div className="mt-4">
            {isOverviewLoading ? (
              <div className="h-7 w-32 bg-gray-150 animate-pulse rounded-md mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-gray-900 tracking-tight block">
                {formatCurrency(stats.tongDoanhThu)}
              </span>
            )}
            <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5 mt-1">
              <span>↑ 12.4%</span>
              <span className="text-gray-400 font-medium">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300 text-emerald-600">
            <FiShoppingBag size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <FiShoppingBag size={20} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Số lượng đơn hàng
            </span>
          </div>
          <div className="mt-4">
            {isOverviewLoading ? (
              <div className="h-7 w-20 bg-gray-150 animate-pulse rounded-md mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-gray-900 tracking-tight block">
                {stats.tongDonHang.toLocaleString()} đơn
              </span>
            )}
            <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5 mt-1">
              <span>↑ 8.2%</span>
              <span className="text-gray-400 font-medium">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Khách hàng */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300 text-cyan-600">
            <FiUsers size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
              <FiUsers size={20} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Khách hàng
            </span>
          </div>
          <div className="mt-4">
            {isOverviewLoading ? (
              <div className="h-7 w-20 bg-gray-150 animate-pulse rounded-md mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-gray-900 tracking-tight block">
                {stats.tongKhachHang.toLocaleString()} khách
              </span>
            )}
            <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5 mt-1">
              <span>↑ 4.1%</span>
              <span className="text-gray-400 font-medium">tăng trưởng mới</span>
            </span>
          </div>
        </div>

        {/* Sản phẩm bán ra */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300 text-violet-600">
            <FiPackage size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 shrink-0">
              <FiPackage size={20} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Sản phẩm bán ra
            </span>
          </div>
          <div className="mt-4">
            {isOverviewLoading ? (
              <div className="h-7 w-24 bg-gray-150 animate-pulse rounded-md mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-gray-900 tracking-tight block">
                {stats.tongSanPhamDaBan.toLocaleString()} chiếc
              </span>
            )}
            <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-0.5 mt-1">
              <span>Hiệu suất</span>
              <span className="text-gray-400 font-medium">phân phối tốt</span>
            </span>
          </div>
        </div>

        {/* Cảnh báo hết hàng */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 group col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300 text-red-600">
            <FiAlertTriangle size={80} />
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                stats.sanPhamSapHetHang > 0
                  ? "bg-red-50 text-red-600 animate-pulse"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <FiAlertTriangle size={20} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Sắp hết hàng
            </span>
          </div>
          <div className="mt-4">
            {isOverviewLoading ? (
              <div className="h-7 w-16 bg-gray-150 animate-pulse rounded-md mt-1" />
            ) : (
              <span
                className={`text-xl font-extrabold tracking-tight block ${
                  stats.sanPhamSapHetHang > 0 ? "text-red-600 font-black" : "text-gray-900"
                }`}
              >
                {stats.sanPhamSapHetHang} sản phẩm
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-medium block mt-1">
              {stats.sanPhamSapHetHang > 0
                ? "⚠️ Yêu cầu kiểm kho gấp!"
                : "✅ Kho hàng an toàn"}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------- 2. Main Analytics Charts Grid -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Revenue Curve Over Time */}
        <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FiTrendingUp size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Biểu đồ Doanh thu & Đơn hàng</h3>
                <p className="text-[10px] text-gray-400">Phân tích tần suất giao dịch</p>
              </div>
            </div>

            {/* Scale Filter toggle */}
            <div className="flex bg-gray-100 rounded-md p-0.5 text-xs font-semibold">
              <button
                onClick={() => setGroupBy("day")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  groupBy === "day"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Theo Ngày
              </button>
              <button
                onClick={() => setGroupBy("month")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  groupBy === "month"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Theo Tháng
              </button>
            </div>
          </div>

          {/* Chart Frame */}
          <div className="relative flex-1 min-h-[300px] flex items-center justify-center">
            {isRevenueLoading ? (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <span className="text-xs font-semibold">Đang tổng hợp dữ liệu biểu đồ...</span>
              </div>
            ) : revenueHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <FiTrendingUp className="mx-auto text-gray-300" size={32} />
                <p className="text-xs font-semibold mt-2">Không tìm thấy dữ liệu phát sinh</p>
                <p className="text-[10px] text-gray-400 max-w-xs mt-1">
                  Vui lòng thay đổi khung thời gian hoặc điều kiện lọc cửa hàng khác.
                </p>
              </div>
            ) : (
              <Line data={lineChartData} options={lineChartOptions as any} />
            )}
          </div>
        </div>

        {/* Right Side: Category share */}
        <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
            <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <FiPieChart size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800">Cơ cấu ngành hàng</h3>
              <p className="text-[10px] text-gray-400">Tỷ trọng doanh số theo danh mục</p>
            </div>
          </div>

          <div className="relative flex-1 flex flex-col justify-between">
            {/* Pie Container */}
            <div className="relative h-[180px] w-full flex items-center justify-center">
              {isCategoryLoading ? (
                <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              ) : categoryShare.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <FiPieChart className="mx-auto text-gray-300" size={28} />
                  <span className="text-xs font-semibold block mt-1">Không có dữ liệu cơ cấu</span>
                </div>
              ) : (
                <Doughnut data={doughnutChartData} options={doughnutChartOptions as any} />
              )}
            </div>

            {/* Category detailed legend list */}
            <div className="mt-4 space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {categoryShare.map((cat, idx) => {
                const sharePercent = totalCatRevenue > 0 ? (cat.doanhThu / totalCatRevenue) * 100 : 0;
                return (
                  <div key={cat.maDm} className="flex items-center justify-between text-xs p-1 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: doughnutColors[idx % doughnutColors.length] }}
                      />
                      <span className="font-bold text-gray-700 truncate">{cat.tenDm}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-gray-900 block">{formatCurrency(cat.doanhThu)}</span>
                      <span className="text-[10px] text-gray-400 block font-medium">
                        {sharePercent.toFixed(1)}% ({cat.soLuongDaBan} cái)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- 3. Top Products and Store Comparison Grid -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Top Products sales */}
        <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-yellow-50 text-amber-500 rounded-lg">
                <FiAward size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Sản phẩm bán chạy nhất</h3>
                <p className="text-[10px] text-gray-400">Top 5 sản phẩm đạt doanh số cao nhất</p>
              </div>
            </div>
          </div>

          <div className="flex-1 divide-y divide-gray-100">
            {isTopLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-3 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-150 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-gray-150 rounded" />
                    <div className="h-2 w-1/4 bg-gray-150 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-gray-150 rounded" />
                </div>
              ))
            ) : topProductsRes?.data?.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <FiPackage className="mx-auto text-gray-300" size={32} />
                <span className="text-xs font-semibold mt-2 block">Chưa phát sinh doanh số sản phẩm</span>
              </div>
            ) : (
              topProductsRes?.data?.map((p, idx) => {
                const maxRevenue = Math.max(...(topProductsRes?.data?.map(x => x.doanhThu) || [1]));
                const pctOfMax = (p.doanhThu / maxRevenue) * 100;
                return (
                  <div key={p.maSp} className="py-3.5 flex items-center gap-4 hover:bg-gray-50/50 px-2 rounded-xl transition-all">
                    {/* Rank indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0 ? "bg-amber-100 text-amber-700" :
                      idx === 1 ? "bg-slate-100 text-slate-700" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Image */}
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {p.anh ? (
                        <img src={p.anh} alt={p.tenSp} className="w-full h-full object-cover" />
                      ) : (
                        <FiPackage className="text-gray-300" size={18} />
                      )}
                    </div>

                    {/* Meta and relative slider */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate leading-snug">
                        {p.tenSp}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-indigo-600 font-bold">
                          Đã bán: {p.soLuongDaBan} cái
                        </span>
                        <div className="flex-1 bg-gray-150 h-1 rounded-full overflow-hidden max-w-[120px] hidden sm:block">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${pctOfMax}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Revenue total */}
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-gray-900 text-xs block">
                        {formatCurrency(p.doanhThu)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Store Comparison (Admin only) / or Stock Transfer alerts for store staff */}
        {isAdmin ? (
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FiBarChart2 size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Doanh thu theo cửa hàng</h3>
                <p className="text-[10px] text-gray-400">So sánh doanh số giữa các chi nhánh chi tiết</p>
              </div>
            </div>

            <div className="relative flex-1 min-h-[250px] flex items-center justify-center">
              {isStoreLoading ? (
                <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              ) : storeComparison.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <FiBarChart2 className="mx-auto text-gray-300" size={32} />
                  <span className="text-xs font-semibold mt-2 block">Không có dữ liệu chi nhánh</span>
                </div>
              ) : (
                <Bar data={barChartData} options={barChartOptions as any} />
              )}
            </div>
          </div>
        ) : (
          /* Staff view: Display detailed notifications/alerts or store instructions */
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <FiPackage size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Báo cáo tồn kho chi nhánh</h3>
                <p className="text-[10px] text-gray-400">Tình hình cung ứng sản phẩm tại store</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <FiTrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Hiệu suất chi nhánh</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Sản phẩm được mua nhiều nhất tại store này là các dòng điện thoại. Tiếp tục đẩy mạnh marketing các sản phẩm đi kèm!
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    stats.sanPhamSapHetHang > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  }`}>
                    <FiAlertTriangle size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Tình trạng cảnh báo hàng tồn</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      {stats.sanPhamSapHetHang > 0
                        ? `Hiện tại chi nhánh của bạn đang có ${stats.sanPhamSapHetHang} sản phẩm chạm mốc sắp hết hàng. Vui lòng chuyển kho bổ sung hoặc nhập thêm hàng!`
                        : "Tất cả các sản phẩm bán chạy tại store đều có lượng tồn kho đạt mức an toàn. Xin chúc mừng!"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <a
                  href="/inventory"
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  Đi tới trang quản lý kho
                  <FiChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
