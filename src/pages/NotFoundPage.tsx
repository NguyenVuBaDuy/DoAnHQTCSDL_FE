import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[#0057AD]">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#0057AD] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Trở về trang chủ
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
