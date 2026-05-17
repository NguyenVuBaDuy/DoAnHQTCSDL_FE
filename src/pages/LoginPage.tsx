import { useState } from 'react';
import electrochainLogo from '../assets/electrochain-logo.png';
import userIconSvg from '../assets/user-icon.svg';
import lockIconSvg from '../assets/lock-icon.svg';
import eyeIconSvg from '../assets/eye-icon.svg';

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log({ employeeId, password, rememberMe });
  };

  return (
    <div
      id="login-page"
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: 'linear-gradient(180deg, #F3F4F6 0%, #FFFFFF 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="w-full max-w-[440px] flex flex-col gap-6">
        {/* Main Login Card */}
        <div
          className="flex flex-col gap-8 rounded-xl border border-[#C1C6D5] bg-white p-10"
          style={{ boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)' }}
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="pb-4">
              <img
                src={electrochainLogo}
                alt="ElectroChain Logo"
                className="h-16 w-16 rounded-lg"
              />
            </div>
            {/* Heading */}
            <div className="pb-1">
              <h1
                className="text-2xl font-semibold leading-8 text-[#191C1D]"
                style={{ letterSpacing: '-0.02em' }}
              >
                Đăng nhập hệ thống
              </h1>
            </div>
            {/* Subtitle */}
            <p className="text-sm leading-5 text-[#414753]">
              Vui lòng nhập thông tin để truy cập
            </p>
          </div>

          {/* Form Section */}
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Employee ID Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="employee-id"
                className="text-xs font-medium leading-4 text-[#414753]"
                style={{ letterSpacing: '0.02em' }}
              >
                Mã nhân viên
              </label>
              <div className="relative">
                <img
                  src={userIconSvg}
                  alt=""
                  className="pointer-events-none absolute top-1/2 h-5 w-auto -translate-y-1/2"
                  style={{ left: '12px' }}
                />
                <input
                  id="employee-id"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Nhập mã nhân viên"
                  className="w-full rounded-lg border border-[#C1C6D5] text-sm text-[#191C1D] placeholder-[#6B7280] outline-none transition-colors focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4]"
                  style={{ padding: '10.5px 16px 10.5px 40px' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium leading-4 text-[#414753]"
                style={{ letterSpacing: '0.02em' }}
              >
                Mật khẩu
              </label>
              <div className="relative">
                <img
                  src={lockIconSvg}
                  alt=""
                  className="pointer-events-none absolute top-1/2 h-5 w-auto -translate-y-1/2"
                  style={{ left: '14px' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-lg border border-[#C1C6D5] text-sm text-[#191C1D] placeholder-[#6B7280] outline-none transition-colors focus:border-[#1A6FD4] focus:ring-1 focus:ring-[#1A6FD4]"
                  style={{ padding: '10.5px 40px' }}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-70 transition-opacity"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <img src={eyeIconSvg} alt="" className="h-[13px] w-[19px]" />
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label
                id="remember-me-label"
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-[#C1C6D5] text-[#1A6FD4] focus:ring-[#1A6FD4]"
                />
                <span className="text-[13px] leading-[18px] text-[#414753]">
                  Duy trì đăng nhập
                </span>
              </label>
            </div>

            {/* Login Button */}
            <button
              id="login-button"
              type="submit"
              className="w-full rounded-lg bg-[#1A6FD4] py-3 text-center text-base font-semibold leading-6 text-white transition-all hover:bg-[#155BB0] active:scale-[0.98] cursor-pointer"
              style={{ boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)' }}
            >
              Đăng nhập
            </button>
          </form>

          {/* Footer Note */}
          <div className="flex flex-col gap-4 border-t border-[#C1C6D5] pt-6">
            <p className="text-center text-[13px] leading-[18px] text-[#414753]">
              Liên hệ quản trị viên nếu quên mật khẩu
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                id="support-link"
                href="#"
                className="text-xs font-medium leading-4 text-[#0057AD] hover:underline transition-colors"
                style={{ letterSpacing: '0.02em' }}
              >
                Hỗ trợ kỹ thuật
              </a>
              <span className="text-base leading-6 text-[#C1C6D5]">•</span>
              <a
                id="terms-link"
                href="#"
                className="text-xs font-medium leading-4 text-[#0057AD] hover:underline transition-colors"
                style={{ letterSpacing: '0.02em' }}
              >
                Điều khoản
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Info */}
        <div className="text-center opacity-60">
          <p className="text-[13px] leading-[18px] text-[#414753]">
            © 2024 ElectroChain Management System. Phiên bản 2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
