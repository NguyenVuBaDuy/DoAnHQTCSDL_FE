export const getAccountStatusName = (
  statusCode?: string,
  fallback: string = "Không xác định",
) => {
  switch (statusCode) {
    case "HoatDong":
      return "Hoạt động";
    case "KhoaCung":
      return "Khóa cứng";
    case "KhoaTam":
      return "Khóa tạm";
    default:
      return statusCode || fallback;
  }
};

export const accountStatuses = [
  { value: "HoatDong", label: "Hoạt động" },
  { value: "KhoaCung", label: "Khóa cứng" },
  { value: "KhoaTam", label: "Khóa tạm" },
];
