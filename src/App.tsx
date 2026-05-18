import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { MainLayout } from './components/layout'
import { DashboardPage } from './features/dashboard'
import { NhanVienListPage } from './features/nhan-vien'
import { CuaHangPage } from './features/cua-hang'
import { SanPhamPage } from './features/san-pham'
import { TonKhoPage } from './features/ton-kho'
import { HoaDonPage } from './features/hoa-don'
import { KhachHangPage } from './features/khach-hang'
import { VoucherPage } from './features/voucher'
import { BaoCaoPage } from './features/bao-cao'
import { CaiDatPage } from './features/cai-dat'
import { useAppDispatch } from './store'
import { fetchCurrentUser } from './store/authSlice'

import { ProtectedRoute, PublicRoute, RoleProtectedRoute } from './components/auth'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Role protected routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['Admin', 'QuanLyCuaHang']} />}>
              <Route path="/employees" element={<NhanVienListPage />} />
            </Route>
            <Route path="/stores" element={<CuaHangPage />} />
            <Route path="/products" element={<SanPhamPage />} />
            <Route path="/inventory" element={<TonKhoPage />} />
            <Route path="/invoices" element={<HoaDonPage />} />
            <Route path="/customers" element={<KhachHangPage />} />
            <Route path="/vouchers" element={<VoucherPage />} />
            <Route path="/reports" element={<BaoCaoPage />} />
            <Route path="/settings" element={<CaiDatPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
