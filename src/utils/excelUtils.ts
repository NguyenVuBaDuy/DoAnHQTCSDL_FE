import * as XLSX from "xlsx";
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ExcelColumn<T> {
  header: string;
  key: keyof T | string;
  transform?: (value: any, item: T) => any;
}

export interface ExportExcelOptions<T> {
  data: T[];
  columns: ExcelColumn<T>[];
  fileName?: string;
  sheetName?: string;
  startRow?: number; // 1-indexed start row
  endRow?: number; // 1-indexed end row (inclusive)
}

/**
 * Reusable utility to export an array of object records to an Excel spreadsheet
 */
export const exportToExcel = <T>({
  data,
  columns,
  fileName = "export.xlsx",
  sheetName = "Dữ liệu",
  startRow,
  endRow,
}: ExportExcelOptions<T>) => {
  let slicedData = [...data];

  // Apply row range slicing if parameters are defined
  // Convert 1-indexed bounds to 0-indexed slice bounds
  const startIdx = startRow !== undefined ? Math.max(0, startRow - 1) : 0;
  const endIdx =
    endRow !== undefined ? Math.min(data.length, endRow) : data.length;

  if (startRow !== undefined || endRow !== undefined) {
    slicedData = slicedData.slice(startIdx, endIdx);
  }

  // Transform raw objects to excel row format based on columns config
  const rows = slicedData.map((item) => {
    const rowObj: Record<string, any> = {};
    columns.forEach((col) => {
      let val: any;
      if (typeof col.key === "string" && col.key.includes(".")) {
        // Handle nested paths (e.g., "nhanvien.hoten")
        val = col.key
          .split(".")
          .reduce((acc, part) => acc && acc[part], item as any);
      } else {
        val = (item as any)[col.key];
      }

      rowObj[col.header] = col.transform ? col.transform(val, item) : val;
    });
    return rowObj;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Setup column widths dynamically based on headers and longest values
  const colWidths = columns.map((col) => {
    const headerLen = col.header.length;
    const maxValLen = rows.reduce((max, row) => {
      const val = row[col.header];
      const valLen = val ? String(val).length : 0;
      return Math.max(max, valLen);
    }, 0);
    return { wch: Math.max(headerLen, maxValLen) + 3 };
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger Excel file download in browser
  const finalFileName = fileName.endsWith(".xlsx")
    ? fileName
    : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalFileName);
};
