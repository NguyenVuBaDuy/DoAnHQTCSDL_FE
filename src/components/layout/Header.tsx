import { useState, useRef, useEffect } from "react";
import { HiOutlineBell, HiOutlineUser, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useAppSelector, useAppDispatch } from "../../store";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { getRoleName } from "../../utils/roleUtils";
const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-white border-b border-[#C1C6D5] flex items-center justify-between px-4 z-40">
      {/* Left: Branch name or greeting */}
      <div>
        <h2 className="text-base font-semibold leading-6 text-[#191C1D]">
          {getRoleName(user?.tennhom)}
        </h2>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
          <HiOutlineBell className="w-5 h-5 text-[#414753]" />
        </button>
        
        {/* Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-[#1A6FD4] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#0057AD]/30 transition-all duration-200"
          >
            <span className="text-sm font-bold leading-5 text-[#F4F5FF]">
              {getInitial(user?.nhanvien?.hoten)}
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header của Dropdown hiển thị thông tin tóm tắt */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.nhanvien?.hoten || "Người dùng"}
                </p>
                <p className="text-[13px] text-gray-500 truncate mt-0.5">
                  {user?.nhanvien?.chucvu || getRoleName(user?.tennhom, "Nhân viên")}
                </p>
              </div>
              
              {/* Các menu actions */}
              <div className="py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <HiOutlineUser className="w-[18px] h-[18px] text-gray-500" />
                  Thông tin cá nhân
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/settings");
                  }}
                >
                  <HiOutlineCog6Tooth className="w-[18px] h-[18px] text-gray-500" />
                  Cài đặt
                </button>
              </div>
              
              <div className="border-t border-gray-100 py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[13px] text-[#BA1A1A] hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <HiOutlineArrowRightOnRectangle className="w-[18px] h-[18px] text-[#BA1A1A]" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
