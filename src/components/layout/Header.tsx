import { useState, useRef, useEffect } from "react";
import { 
  HiOutlineUser, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingStorefront,
  HiOutlineChevronDown
} from "react-icons/hi2";
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
    return name.trim().split(" ").pop()?.charAt(0).toUpperCase() || name.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-white/95 backdrop-blur-md border-b border-[#C1C6D5]/80 flex items-center justify-between px-6 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      {/* Left: Role & Store Info */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-semibold text-[#0057AD] bg-[#E8F1FD] px-2.5 py-1 rounded-full border border-[#D0E1FB]">
          {getRoleName(user?.tennhom)}
        </span>
        
        {user?.nhanvien?.cuahang ? (
          <>
            <div className="w-[1px] h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[12px] border border-emerald-200/80 shadow-sm">
              <HiOutlineBuildingStorefront className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user.nhanvien.cuahang.tench}</span>
            </div>
          </>
        ) : (
          (user?.tennhom === "Admin" || user?.tennhom === "QuanLyCuaHang") && (
            <>
              <div className="w-[1px] h-4 bg-gray-300" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[12px] border border-amber-200/80 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Toàn bộ hệ thống</span>
              </div>
            </>
          )
        )}
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200/60 cursor-pointer transition-all duration-200 select-none"
          >
            {/* Avatar Circle with Sleek Gradient */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0057AD] to-[#1A6FD4] flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold leading-5 text-[#F4F5FF]">
                {getInitial(user?.nhanvien?.hoten)}
              </span>
            </div>
            
            {/* User Name */}
            <span className="text-[13px] font-semibold text-gray-700 hidden sm:inline-block">
              {user?.nhanvien?.hoten || "Người dùng"}
            </span>

            <HiOutlineChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),_0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.nhanvien?.hoten || "Người dùng"}
                </p>
                <p className="text-[12px] text-gray-500 truncate mt-0.5">
                  {getRoleName(user?.nhanvien?.chucvu || user?.tennhom, "Nhân viên")}
                </p>
                
                {/* Store details block inside dropdown */}
                {user?.nhanvien?.cuahang && (
                  <div className="mt-2.5 px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cửa hàng trực thuộc</span>
                    <span className="text-[12px] font-semibold text-gray-700 truncate">{user.nhanvien.cuahang.tench}</span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">{user.nhanvien.cuahang.diachi}</span>
                  </div>
                )}
              </div>
              
              {/* Menu items */}
              <div className="py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <HiOutlineUser className="w-[18px] h-[18px] text-gray-400" />
                  Thông tin cá nhân
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/settings");
                  }}
                >
                  <HiOutlineCog6Tooth className="w-[18px] h-[18px] text-gray-400" />
                  Cài đặt
                </button>
              </div>
              
              {/* Logout Block */}
              <div className="border-t border-gray-100 pt-1 mt-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#BA1A1A] hover:bg-red-50/70 flex items-center gap-2.5 transition-colors"
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
