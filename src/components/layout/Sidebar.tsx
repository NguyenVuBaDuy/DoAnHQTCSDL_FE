import { NavLink, useNavigate } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineBuildingStorefront,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineArchiveBox,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineTicket,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'

const mainNavItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: HiOutlineHome },
  { to: '/cua-hang', label: 'Cửa hàng', icon: HiOutlineBuildingStorefront },
  { to: '/nhan-vien', label: 'Nhân viên', icon: HiOutlineUsers },
  { to: '/san-pham', label: 'Sản phẩm', icon: HiOutlineCube },
  { to: '/ton-kho', label: 'Tồn kho', icon: HiOutlineArchiveBox },
  { to: '/hoa-don', label: 'Hóa đơn', icon: HiOutlineDocumentText },
  { to: '/khach-hang', label: 'Khách hàng', icon: HiOutlineUserGroup },
  { to: '/voucher', label: 'Voucher', icon: HiOutlineTicket },
  { to: '/bao-cao', label: 'Báo cáo', icon: HiOutlineChartBar },
]

const Sidebar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-[#C1C6D5] flex flex-col justify-between py-6 z-50">
      {/* Brand */}
      <div className="px-0 pb-8">
        <div className="px-6">
          <h1 className="text-xl font-bold leading-7 tracking-tight text-[#0057AD]">
            ElectroChain
          </h1>
          <p className="text-[13px] leading-[18px] text-[#414753]">
            Hệ thống quản lý
          </p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm leading-5 transition-all duration-200 ${
                isActive
                  ? 'bg-[#D0E1FB] text-[#54647A] border-l-4 border-[#0057AD] font-medium'
                  : 'text-[#414753] hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="border-t border-[#C1C6D5] pt-4 px-4 space-y-1">
        <NavLink
          to="/cai-dat"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm leading-5 transition-all duration-200 ${
              isActive
                ? 'bg-[#D0E1FB] text-[#54647A] border-l-4 border-[#0057AD] font-medium'
                : 'text-[#414753] hover:bg-gray-100'
            }`
          }
        >
          <HiOutlineCog6Tooth className="w-5 h-5 flex-shrink-0" />
          <span>Cài đặt</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm leading-5 text-[#414753] hover:bg-gray-100 w-full transition-all duration-200"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5 flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
