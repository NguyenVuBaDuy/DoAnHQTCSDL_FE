import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import { MainLayout } from './components/layout'
import { DashboardPage } from './features/dashboard'
import { NhanVienListPage } from './features/nhan-vien'
import { CuaHangPage } from './features/cua-hang'
import { SanPhamPage, SanPhamCreatePage, SanPhamUpdatePage, SanPhamDetailPage } from './features/san-pham'
import { TonKhoPage } from './features/ton-kho'
import { HoaDonPage } from './features/hoa-don'
import { KhachHangPage } from './features/khach-hang'
import { NhaCungCapPage } from './features/nha-cung-cap'
import { VoucherPage } from './features/voucher'
import { BaoCaoPage } from './features/bao-cao'
import { CaiDatPage } from './features/cai-dat'
import { useAppDispatch, useAppSelector } from './store'
import { fetchCurrentUser } from './store/authSlice'

const HomeRedirect = () => {
  const { user } = useAppSelector((state) => state.auth)
  if (!user) return <Navigate to="/login" replace />
  
  const role = user.tennhom
  if (role === 'NhanVienBan') {
    return <Navigate to="/products" replace />
  }
  if (role === 'NhanVienKho') {
    return <Navigate to="/inventory" replace />
  }
  return <Navigate to="/dashboard" replace />
}

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
      <Toaster position="top-right" />
      <Routes>
        {/* Auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* Role protected routes with layout */}
          <Route element={<RoleProtectedRoute allowedRoles={['Admin', 'QuanLyCuaHang']} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<NhanVienListPage />} />
              <Route path="/reports" element={<BaoCaoPage />} />
            </Route>
          </Route>

          {/* Admin only routes with layout */}
          <Route element={<RoleProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/stores" element={<CuaHangPage />} />
              <Route path="/customers" element={<KhachHangPage />} />
              <Route path="/suppliers" element={<NhaCungCapPage />} />
            </Route>
          </Route>
          {/* Products, Invoices, Vouchers protected routes with layout */}
          <Route element={<RoleProtectedRoute allowedRoles={['Admin', 'QuanLyCuaHang', 'NhanVienBan']} />}>
            <Route element={<MainLayout />}>
              <Route path="/products" element={<SanPhamPage />} />
              <Route path="/products/create" element={<SanPhamCreatePage />} />
              <Route path="/products/edit/:maSp" element={<SanPhamUpdatePage />} />
              <Route path="/products/detail/:maSp" element={<SanPhamDetailPage />} />
              <Route path="/invoices" element={<HoaDonPage />} />
              <Route path="/vouchers" element={<VoucherPage />} />
            </Route>
          </Route>

          {/* Standard protected routes with layout */}
          <Route element={<MainLayout />}>
            <Route path="/inventory" element={<TonKhoPage />} />
            <Route path="/settings" element={<CaiDatPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
