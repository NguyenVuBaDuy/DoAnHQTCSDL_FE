import { useState, useEffect } from "react";
import { FiX, FiFileText, FiSliders, FiCheck } from "react-icons/fi";
import { exportToExcel } from "../../utils/excelUtils";
import type { ExcelColumn } from "../../utils/excelUtils";

interface ExportExcelModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data: T[];
  columns: ExcelColumn<T>[];
  defaultFileName: string;
  sheetName?: string;
}

export const ExportExcelModal = <T,>({
  isOpen,
  onClose,
  data,
  columns,
  defaultFileName,
  sheetName = "Dữ liệu",
}: ExportExcelModalProps<T>) => {
  const [exportMode, setExportMode] = useState<"all" | "range">("all");
  const [rangeType, setRangeType] = useState<"row" | "page">("row");
  const [fileName, setFileName] = useState(defaultFileName);

  // Row Range States
  const [startRow, setStartRow] = useState<number>(1);
  const [endRow, setEndRow] = useState<number>(data.length || 1);

  // Page Range States
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Error validations
  const [error, setError] = useState<string | null>(null);

  // Pre-fill / reset bounds when data changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEndRow(data.length || 1);
  }, [data]);

  // Synchronize derived bounds when page range configs change
  useEffect(() => {
    if (exportMode === "range" && rangeType === "page") {
      const calculatedStart = (startPage - 1) * pageSize + 1;
      const calculatedEnd = endPage * pageSize;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStartRow(calculatedStart);
      setEndRow(Math.min(data.length, calculatedEnd));
    }
  }, [exportMode, rangeType, startPage, endPage, pageSize, data.length]);

  if (!isOpen) return null;

  const handleExport = () => {
    // Basic validation
    if (exportMode === "range") {
      if (startRow <= 0 || endRow <= 0) {
        setError("Dòng bắt đầu và kết thúc phải lớn hơn 0");
        return;
      }
      if (startRow > endRow) {
        setError("Dòng bắt đầu không thể lớn hơn dòng kết thúc");
        return;
      }
      if (startRow > data.length) {
        setError(
          `Dòng bắt đầu không thể lớn hơn tổng số dòng hiện có (${data.length})`,
        );
        return;
      }
    }

    setError(null);
    exportToExcel({
      data,
      columns,
      fileName,
      sheetName,
      startRow: exportMode === "range" ? startRow : undefined,
      endRow: exportMode === "range" ? endRow : undefined,
    });
    onClose();
  };

  const totalSelectedRows =
    exportMode === "all"
      ? data.length
      : Math.max(0, Math.min(data.length, endRow) - Math.max(1, startRow) + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#E8F1FD] text-[#0057AD]">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Cấu hình xuất Excel
              </h3>
              <p className="text-xs text-gray-500">
                Tùy chọn xuất bảng dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4 text-sm flex-1">
          {/* File Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">
              Tên file Excel
            </label>
            <div className="relative">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium pr-14 text-gray-800"
                placeholder="Tên_file_xuat"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                .xlsx
              </span>
            </div>
          </div>

          {/* Scope Select / Tabs */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="font-semibold text-gray-700">
              Phạm vi xuất dữ liệu
            </label>
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl border border-gray-200/50">
              <button
                type="button"
                onClick={() => setExportMode("all")}
                className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  exportMode === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Tất cả ({data.length})
              </button>
              <button
                type="button"
                onClick={() => setExportMode("range")}
                className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 ${
                  exportMode === "range"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Tùy chọn phạm vi
              </button>
            </div>
          </div>

          {/* Range Settings options */}
          {exportMode === "range" && (
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3.5 animate-in slide-in-from-top-2 duration-200">
              {/* Select Page vs Row */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 text-xs select-none">
                  <input
                    type="radio"
                    name="rangeType"
                    checked={rangeType === "row"}
                    onChange={() => setRangeType("row")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Theo số dòng</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 text-xs select-none">
                  <input
                    type="radio"
                    name="rangeType"
                    checked={rangeType === "page"}
                    onChange={() => setRangeType("page")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Theo trang</span>
                </label>
              </div>

              {rangeType === "row" ? (
                /* Row Bounds Input */
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-gray-500">
                      Từ dòng
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={data.length}
                      value={startRow}
                      onChange={(e) =>
                        setStartRow(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-gray-500">
                      Đến dòng (hết {data.length})
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={endRow}
                      onChange={(e) =>
                        setEndRow(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                    />
                  </div>
                </div>
              ) : (
                /* Page Config Bounds Input */
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-500">
                        Từ trang
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={startPage}
                        onChange={(e) =>
                          setStartPage(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-500">
                        Đến trang
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={endPage}
                        onChange={(e) =>
                          setEndPage(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-500">
                        Số dòng/Trang
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={pageSize}
                        onChange={(e) =>
                          setPageSize(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Range mapping summary help text */}
                  <div className="text-[11px] text-gray-500 flex items-center gap-1 bg-white p-2 rounded-lg border border-gray-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <FiSliders className="text-blue-500 w-3 h-3" />
                    <span>
                      Tương đương xuất từ dòng{" "}
                      <strong className="text-gray-700">{startRow}</strong> đến
                      dòng <strong className="text-gray-700">{endRow}</strong>{" "}
                      (Tổng cộng {totalSelectedRows} dòng)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Validation Error Message */}
          {error && (
            <div className="text-xs text-red-600 font-semibold p-2.5 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          {/* Range Selection Details Label */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2 px-1 bg-gray-50 py-2.5 rounded-lg border border-gray-100">
            <span className="font-semibold text-gray-600 pl-3">
              Dữ liệu sẽ xuất:
            </span>
            <span className="font-bold text-blue-600 pr-3">
              {totalSelectedRows} dòng
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm rounded-lg hover:shadow"
          >
            <FiCheck className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
