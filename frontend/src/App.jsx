import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';


// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import NewOrderPage from './pages/student/NewOrderPage';
import OrderDetailPage from './pages/student/OrderDetailPage';
import OrderHistoryPage from './pages/student/OrderHistoryPage';
import DocumentConverter from './pages/student/DocumentConverter';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrderDetail from './pages/staff/StaffOrderDetail';

// Admin Pages (Phase 14 Active)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminStaff from './pages/admin/AdminStaff';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStationery from './pages/admin/AdminStationery';
import AdminPricing from './pages/admin/AdminPricing';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Student Portal */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="new-order" element={<NewOrderPage />} />
                  <Route path="document-converter" element={<DocumentConverter />} />
                  <Route path="orders" element={<OrderHistoryPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="history" element={<OrderHistoryPage />} />
                </Route>

                {/* Staff Portal */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['XEROX_STAFF', 'ADMIN']}>
                      <StaffLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StaffDashboard />} />
                  <Route path="orders" element={<StaffDashboard />} />
                  <Route path="orders/:id" element={<StaffOrderDetail />} />
                  <Route path="completed" element={<StaffDashboard />} />
                </Route>

                {/* Admin Portal (All Phase 14 Routes Connected) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="stationery" element={<AdminStationery />} />
                  <Route path="pricing" element={<AdminPricing />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="reports" element={<AdminReports />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
