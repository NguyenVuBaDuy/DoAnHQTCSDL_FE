import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="ml-[220px] mt-12 min-h-[calc(100vh-48px)] overflow-auto">
        <div className="p-6 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout
