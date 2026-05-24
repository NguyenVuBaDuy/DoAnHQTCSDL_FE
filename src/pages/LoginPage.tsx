import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import electrochainLogo from "../assets/electrochain-logo.png";
import userIconSvg from "../assets/user-icon.svg";
import lockIconSvg from "../assets/lock-icon.svg";
import eyeIconSvg from "../assets/eye-icon.svg";

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { mutate: login, isPending, error, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { manv: employeeId, password },
      {
        onSuccess: (data) => {
          const role = data.data.user?.tennhom;
          if (role === "NhanVienBan") {
            navigate("/products");
          } else if (role === "NhanVienKho") {
            navigate("/inventory");
          } else {
            navigate("/dashboard");
          }
        },
      },
    );
  };

  return (
    <div
      id="login-page"
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(circle at top, #EAF3FF 0%, #F6F8FB 42%, #FFFFFF 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="w-full max-w-[480px]">
        <div className="rounded-2xl border border-[#D8DEE9] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)] ">
          <div className="px-8 py-9">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F8FF] shadow-sm">
                <img
                  src={electrochainLogo}
                  alt="ElectroChain Logo"
                  className="h-11 w-11 rounded-xl"
                />
              </div>

              <h1 className="text-2xl font-bold text-[#111827]">
                Đăng nhập hệ thống
              </h1>

              <p className="mt-1 text-sm text-[#6B7280]">
                Vui lòng nhập thông tin để truy cập
              </p>
            </div>

            <form
              id="login-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="employee-id"
                  className="text-sm font-medium text-[#374151]"
                >
                  Mã nhân viên
                </label>

                <div className="relative">
                  <img
                    src={userIconSvg}
                    alt=""
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
                  />

                  <input
                    id="employee-id"
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Nhập mã nhân viên"
                    className="h-11 w-full rounded-xl border border-[#D1D7E3] bg-white text-sm text-[#111827] outline-none transition focus:border-[#1A6FD4] focus:ring-3 focus:ring-[#1A6FD4]/15"
                    style={{ padding: "0 16px 0 46px" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#374151]"
                >
                  Mật khẩu
                </label>

                <div className="relative">
                  <img
                    src={lockIconSvg}
                    alt=""
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="h-11 w-full rounded-xl border border-[#D1D7E3] bg-white text-sm text-[#111827] outline-none transition focus:border-[#1A6FD4] focus:ring-3 focus:ring-[#1A6FD4]/15"
                    style={{ padding: "0 46px 0 46px" }}
                  />

                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-slate-100"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <img
                      src={eyeIconSvg}
                      alt=""
                      className="h-[14px] w-[20px] opacity-75"
                    />
                  </button>
                </div>
              </div>

              <label
                id="remember-me-label"
                className="flex w-fit cursor-pointer items-center gap-2 pt-1"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-[#C1C6D5] text-[#1A6FD4] focus:ring-[#1A6FD4]"
                />
                <span className="text-sm text-[#4B5563]">
                  Duy trì đăng nhập
                </span>
              </label>

              {isError && (
                <div
                  id="login-error"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error?.message || "Đã xảy ra lỗi, vui lòng thử lại"}
                </div>
              )}

              <button
                id="login-button"
                type="submit"
                disabled={isPending}
                className="mt-1 h-11 w-full rounded-xl bg-[#1A6FD4] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(26,111,212,0.25)] transition hover:bg-[#155BB0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
          </div>

          <div className="rounded-b-2xl border-t border-[#E3E9F3] bg-[#F8FAFC] px-8 py-4 text-center">
            <p className="text-sm text-[#6B7280]">
              Liên hệ quản trị viên nếu quên mật khẩu
            </p>

            <div className="mt-3 flex items-center justify-center gap-4">
              <a
                id="support-link"
                href="#"
                className="text-sm font-medium text-[#1A6FD4] transition hover:text-[#155BB0] hover:underline"
              >
                Hỗ trợ kỹ thuật
              </a>

              <span className="text-[#CBD5E1]">•</span>

              <a
                id="terms-link"
                href="#"
                className="text-sm font-medium text-[#1A6FD4] transition hover:text-[#155BB0] hover:underline"
              >
                Điều khoản
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#8A94A6]">
          © 2024 ElectroChain Management System. Phiên bản 2.4.0
        </p>
      </div>
    </div>
  );
}
