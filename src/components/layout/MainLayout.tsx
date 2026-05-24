import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  return (
    <div className="h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="ml-[220px] mt-12 h-[calc(100vh-48px)] overflow-auto relative">
        <div className="p-6 space-y-6 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout
