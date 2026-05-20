import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiTag,
  FiHelpCircle,
  FiFileText,
  FiToggleLeft,
  FiToggleRight,
  FiLoader,
} from "react-icons/fi";
import { danhMucService } from "../../../services/danhMucService";
import { uploadService } from "../../../services/uploadService";
import { sanPhamService } from "../../../services/sanPhamService";
import toast from "react-hot-toast";
/* eslint-disable @typescript-eslint/no-explicit-any */

interface VariantSKU {
  mauSac: string;
  dungLuong: string;
  kichThuoc: string;
  giaNhap: number;
  giaBan: number;
  sku: string;
  barcode: string;
  trangThai: string;
}

const SanPhamCreatePage = () => {
  const navigate = useNavigate();
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log(lastSavedTime);

  // Set initial saved time
  useEffect(() => {
    const now = new Date();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSavedTime(`${hours}:${minutes}`);
  }, []);

  // Form State
  const [tenSp, setTenSp] = useState("");
  const [moTa, setMoTa] = useState("");
  const [thuongHieu, setThuongHieu] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | "">("");
  const [selectedChildId, setSelectedChildId] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(true);

  // Square image preview initialized to null
  const [image, setImage] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant Form States
  const [variants, setVariants] = useState<VariantSKU[]>([]);

  // AI Suggestion State
  const [showAiTip, setShowAiTip] = useState(true);

  // Query Categories
  const { data: catResponse, isLoading: isCatLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: () => danhMucService.getCategoryTree(),
  });

  const parentCategories = catResponse?.data || [];

  // Find child categories for the selected parent
  const selectedParent = parentCategories.find(
    (c) => c.maDm === Number(selectedParentId),
  );
  const childCategories = selectedParent?.children || [];

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng định dạng file ảnh!");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Dung lượng file tối đa là 5MB!");
      return;
    }

    setIsUploading(true);
    toast
      .promise(uploadService.uploadImage(file), {
        loading: "Đang tải ảnh lên...",
        success: (response) => {
          setImage(response.data.url);
          return "Tải ảnh lên thành công!";
        },
        error: (err: any) => {
          return (
            err?.response?.data?.message || err?.message || "Không thể tải ảnh!"
          );
        },
      })
      .finally(() => {
        setIsUploading(false);
        if (e.target) e.target.value = "";
      });
  };

  // Handle Parent Category Change
  const handleParentCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedParentId(e.target.value ? Number(e.target.value) : "");
    setSelectedChildId(""); // Reset subcategory
  };

  // Add Variant manually
  const handleAddVariant = () => {
    const cleanSpName = tenSp
      ? tenSp
          .trim()
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase())
          .join("")
      : "SP";
    const suffix = variants.length + 1;
    const generatedSku = `${cleanSpName}-${suffix}-${Math.floor(100 + Math.random() * 900)}`;
    const prefix = "893";
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    const generatedBarcode = `${prefix}${randomDigits}`;

    setVariants([
      ...variants,
      {
        mauSac: "",
        dungLuong: "",
        kichThuoc: "",
        giaNhap: 0,
        giaBan: 0,
        sku: generatedSku,
        barcode: generatedBarcode,
        trangThai: "DangBan",
      },
    ]);
  };

  // Remove Variant manually
  const handleRemoveVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImage(newImageUrl.trim());
    setNewImageUrl("");
    setShowImageInput(false);
    toast.success("Đã thêm ảnh xem trước!");
  };

  // Remove Image
  const handleRemoveImage = () => {
    setImage(null);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!tenSp.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!selectedParentId) {
      toast.error("Vui lòng chọn danh mục chính!");
      return;
    }
    if (childCategories.length > 0 && !selectedChildId) {
      toast.error("Vui lòng chọn danh mục con!");
      return;
    }

    const maDm = selectedChildId
      ? Number(selectedChildId)
      : Number(selectedParentId);

    // Validate variants
    if (variants.length === 0) {
      toast.error("Vui lòng thêm ít nhất một biến thể!");
      return;
    }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const varNum = i + 1;

      if (!v.mauSac.trim()) {
        toast.error(`Vui lòng nhập Màu sắc cho biến thể số ${varNum}!`);
        return;
      }
      if (!v.sku.trim()) {
        toast.error(`Vui lòng nhập Mã SKU cho biến thể số ${varNum}!`);
        return;
      }
      if (!v.barcode.trim()) {
        toast.error(`Vui lòng nhập Mã Barcode cho biến thể số ${varNum}!`);
        return;
      }
      if (v.giaNhap < 0) {
        toast.error(`Giá nhập của biến thể số ${varNum} không được âm!`);
        return;
      }
      if (v.giaBan <= 0) {
        toast.error(`Giá bán của biến thể số ${varNum} phải lớn hơn 0!`);
        return;
      }
      if (v.giaBan <= v.giaNhap) {
        const varName = [v.mauSac, v.dungLuong, v.kichThuoc]
          .filter(Boolean)
          .join(" - ");
        toast.error(
          `Giá bán của biến thể số ${varNum} (${varName}) phải lớn hơn giá nhập!`,
        );
        return;
      }
    }

    // Build API payload variants
    const payloadVariants = variants.map((v) => ({
      sku: v.sku.trim(),
      barcode: v.barcode.trim(),
      mauSac: v.mauSac.trim() || null,
      dungLuong: v.dungLuong.trim() || null,
      kichThuoc: v.kichThuoc.trim() || null,
      giaNhap: Number(v.giaNhap) || 0,
      giaBan: Number(v.giaBan) || 0,
      trangThai: v.trangThai,
    }));

    const payload = {
      maDm,
      tenSp: tenSp.trim(),
      thuongHieu: thuongHieu.trim(),
      moTa: moTa.trim(),
      anh: image || "",
      trangThai: isPublic ? "DangBan" : "NgungBan",
      variants: payloadVariants,
    };

    setIsSubmitting(true);
    toast
      .promise(sanPhamService.createSanPham(payload), {
        loading: "Đang lưu sản phẩm...",
        success: <b>Thêm mới sản phẩm thành công!</b>,
        error: (err: any) => {
          return (
            err?.response?.data?.message ||
            err?.message ||
            "Có lỗi xảy ra khi lưu sản phẩm!"
          );
        },
      })
      .then(() => {
        navigate("/products");
      })
      .catch(() => {})
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed top-12 left-[220px] right-0 bottom-0 flex flex-col bg-[#F8F9FA] overflow-hidden z-30 font-sans">
      {/* Page Header */}
      <div className="bg-white border-b border-[#C1C6D5]/60 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/products")}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            title="Quay lại"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span>Sản phẩm</span>
              <span>/</span>
              <span className="text-gray-600">Thêm mới</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 mt-0.5">
              Thêm mới sản phẩm
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 pb-28 custom-scrollbar"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Columns - Main Info Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: General Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FiFileText size={18} />
                </div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Thông tin chung
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                    value={tenSp}
                    onChange={(e) => setTenSp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về sản phẩm, thông số kỹ thuật, bảo hành..."
                    value={moTa}
                    onChange={(e) => setMoTa(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 min-h-[100px] transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Images Upload (Tỷ lệ 1:1) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <FiUploadCloud size={18} />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Hình ảnh sản phẩm
                  </h2>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {!image ? (
                  /* Square Upload zone placeholder */
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    disabled={isUploading}
                    className="w-56 h-56 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-gray-500 hover:text-blue-600 hover:bg-blue-50/20 transition-all cursor-pointer disabled:opacity-50 aspect-square shadow-sm"
                  >
                    {isUploading ? (
                      <FiLoader
                        size={32}
                        className="animate-spin text-blue-600 mb-1"
                      />
                    ) : (
                      <FiUploadCloud
                        size={32}
                        className="animate-bounce duration-1000 text-gray-400"
                      />
                    )}
                    <span className="text-sm font-bold text-center leading-tight">
                      {isUploading ? "Đang tải ảnh..." : "Tải ảnh lên"}
                    </span>
                    <span className="text-[10px] text-gray-400 text-center max-w-[150px]">
                      Kéo thả hoặc click để chọn ảnh JPEG, PNG (Tối đa 5MB)
                    </span>
                  </button>
                ) : (
                  /* Square Image Preview Layout */
                  <div className="relative w-56 h-56 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-md group flex items-center justify-center aspect-square">
                    <img
                      src={image}
                      alt="Product preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleTriggerUpload}
                        disabled={isUploading}
                        className="p-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-xl shadow-md transition-all transform hover:scale-110"
                        title="Thay đổi hình ảnh"
                      >
                        <FiUploadCloud size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all transform hover:scale-110"
                        title="Xóa hình ảnh"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Image URL Modal/Row */}
              {showImageInput && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="url"
                    placeholder="Dán link ảnh tại đây (Cloudinary, Unsplash, v.v...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className="p-1.5 border border-gray-300 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {/* Optional URL upload toggle */}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold flex items-center gap-1"
                >
                  {showImageInput ? "Ẩn nhập URL" : "Hoặc nhập URL ảnh từ xa"}
                </button>
              </div>
            </div>

            {/* Card 3: Variants / Phân loại */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <FiTag size={18} />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Thông tin bán hàng & Biến thể
                  </h2>
                </div>
              </div>

              {/* Variant list */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-500 italic">
                    Tự nhập thủ công từng biến thể cho sản phẩm. Nhấn nút "Thêm
                    biến thể" để thêm dòng mới.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-all shrink-0"
                  >
                    <FiPlus size={14} />
                    Thêm biến thể
                  </button>
                </div>

                {/* Variant Cards */}
                {variants.length > 0 ? (
                  <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-xl bg-gray-50/40 p-4 hover:border-blue-200 transition-colors"
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Biến thể #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Xóa biến thể"
                          >
                            <FiX size={14} />
                          </button>
                        </div>

                        {/* Row 1: Thuộc tính */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Màu sắc <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={v.mauSac}
                              placeholder="Ví dụ: Đen"
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].mauSac = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Dung lượng
                            </label>
                            <input
                              type="text"
                              value={v.dungLuong}
                              placeholder="Ví dụ: 256GB"
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].dungLuong = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Kích thước
                            </label>
                            <input
                              type="text"
                              value={v.kichThuoc}
                              placeholder="Ví dụ: 6.7 inch"
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].kichThuoc = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                            />
                          </div>
                        </div>

                        {/* Row 2: Giá */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Giá nhập (đ)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={v.giaNhap === 0 ? "" : v.giaNhap.toLocaleString("vi-VN")}
                              placeholder="0"
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                                const val = raw ? Number(raw) : 0;
                                const updated = [...variants];
                                updated[idx].giaNhap = val;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Giá bán (đ) <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={v.giaBan === 0 ? "" : v.giaBan.toLocaleString("vi-VN")}
                              placeholder="0"
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                                const val = raw ? Number(raw) : 0;
                                const updated = [...variants];
                                updated[idx].giaBan = val;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                            />
                          </div>
                        </div>

                        {/* Row 3: SKU, Barcode, Trạng thái */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Mã SKU <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].sku = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Mã Barcode <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={v.barcode}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  updated[idx].barcode = e.target.value;
                                  setVariants(updated);
                                }}
                                className="flex-1 min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const prefix = "893";
                                  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
                                  const updated = [...variants];
                                  updated[idx].barcode = `${prefix}${randomDigits}`;
                                  setVariants(updated);
                                  toast.success("Đã tạo barcode mới!");
                                }}
                                className="px-2 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors shrink-0"
                                title="Tạo mã barcode ngẫu nhiên"
                              >
                                <FiRefreshCw size={11} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Trạng thái
                            </label>
                            <select
                              value={v.trangThai}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].trangThai = e.target.value;
                                setVariants(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                            >
                              <option value="DangBan">Đang bán</option>
                              <option value="NgungBan">Ngừng bán</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                    Chưa có biến thể nào. Nhấn &quot;Thêm biến thể&quot; để bắt đầu nhập.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Columns - Metadata Cards */}
          <div className="space-y-6 relative">
            {/* Card 4: Status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4">
                Trạng thái hiển thị
              </h2>

              <div className="space-y-3">
                <div
                  onClick={() => setIsPublic(!isPublic)}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-700">
                    Công khai sản phẩm
                  </span>
                  <button
                    type="button"
                    className="text-2xl text-blue-600 focus:outline-none"
                  >
                    {isPublic ? (
                      <FiToggleRight className="w-9 h-6 text-blue-600" />
                    ) : (
                      <FiToggleLeft className="w-9 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 italic leading-normal">
                  Sản phẩm sẽ hiển thị trên hệ thống bán hàng nội bộ và trang
                  web của cửa hàng ngay sau khi được lưu thành công.
                </p>
              </div>
            </div>

            {/* Card 5: Category & Brand */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4">
                Phân loại & Thương hiệu
              </h2>

              <div className="space-y-4">
                {/* Category Main */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Danh mục chính <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedParentId}
                    onChange={handleParentCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    <option value="">-- Chọn danh mục chính --</option>
                    {isCatLoading ? (
                      <option disabled>Đang tải danh mục...</option>
                    ) : (
                      parentCategories.map((cat: any) => (
                        <option key={cat.maDm} value={cat.maDm}>
                          {cat.tenDm}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Danh mục con {childCategories.length > 0 && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={selectedChildId}
                    onChange={(e) =>
                      setSelectedChildId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    disabled={!selectedParentId || childCategories.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {!selectedParentId
                        ? "Vui lòng chọn danh mục chính trước"
                        : childCategories.length === 0
                          ? "Không có danh mục con"
                          : "-- Chọn danh mục con --"}
                    </option>
                    {childCategories.map((child: any) => (
                      <option key={child.maDm} value={child.maDm}>
                        {child.tenDm}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Apple, Samsung, Sony..."
                    value={thuongHieu}
                    onChange={(e) => setThuongHieu(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs placeholder-gray-400"
                  />

                  {/* Brand quick picks */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Apple", "Samsung", "Sony", "Dell", "Asus"].map(
                      (brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setThuongHieu(brand)}
                          className="text-[10px] font-semibold text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                        >
                          +{brand}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating AI Helper Bubble */}
            {showAiTip && (
              <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg border border-indigo-900/10 p-4 relative animate-in fade-in zoom-in-95 duration-300">
                <button
                  type="button"
                  onClick={() => setShowAiTip(false)}
                  className="absolute top-2.5 right-2.5 text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                >
                  <FiX size={13} />
                </button>
                <div className="flex gap-2">
                  <div className="text-yellow-300 p-1 mt-0.5">
                    <FiHelpCircle
                      size={18}
                      className="animate-spin-slow duration-5000"
                    />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-yellow-300 uppercase tracking-wider">
                      Gợi ý AI
                    </h4>
                    <p className="text-[11px] text-blue-50/90 mt-1 leading-relaxed">
                      Hãy thêm mô tả chi tiết về các tính năng độc quyền để tăng
                      tỷ lệ chuyển đổi lên 15%.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Sticky Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-gray-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Hệ thống API hoạt động hoàn hảo</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <FiLoader size={16} className="animate-spin" />
            ) : (
              <FiCheck size={16} />
            )}
            Hoàn tất & Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SanPhamCreatePage;
