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

import { ProtectedRoute, PublicRoute } from './components/auth'

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
            <Route path="/nhan-vien" element={<NhanVienListPage />} />
            <Route path="/cua-hang" element={<CuaHangPage />} />
            <Route path="/san-pham" element={<SanPhamPage />} />
            <Route path="/ton-kho" element={<TonKhoPage />} />
            <Route path="/hoa-don" element={<HoaDonPage />} />
            <Route path="/khach-hang" element={<KhachHangPage />} />
            <Route path="/voucher" element={<VoucherPage />} />
            <Route path="/bao-cao" element={<BaoCaoPage />} />
            <Route path="/cai-dat" element={<CaiDatPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
