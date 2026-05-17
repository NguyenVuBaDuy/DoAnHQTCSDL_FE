import { HiOutlineBell } from 'react-icons/hi2'
import { useAppSelector } from '../../store'

const Header = () => {
  const user = useAppSelector((state) => state.auth.user)

  const getInitial = (name?: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-white border-b border-[#C1C6D5] flex items-center justify-between px-4 z-40">
      {/* Left: Branch name or greeting */}
      <div>
        <h2 className="text-base font-semibold leading-6 text-[#191C1D]">
          {user?.tennhom || 'Hệ thống quản lý'}
        </h2>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
          <HiOutlineBell className="w-5 h-5 text-[#414753]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#1A6FD4] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#0057AD]/30 transition-all duration-200">
          <span className="text-sm font-bold leading-5 text-[#F4F5FF]">
            {getInitial(user?.nhanvien?.hoten)}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
