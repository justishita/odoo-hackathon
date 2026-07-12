import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/common/Layout';

// Import Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrganizationSetupPage from './pages/OrganizationSetupPage';
import AssetDirectoryPage from './pages/AssetDirectoryPage';
import AllocationPage from './pages/AllocationPage';
import BookingPage from './pages/BookingPage';
import MaintenancePage from './pages/MaintenancePage';
import AuditListPage from './pages/AuditListPage';
import ReportsPage from './pages/ReportsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes wrapped in Auth Check */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />
            <Route
              path="/organization"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <OrganizationSetupPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <Layout>
                  <AssetDirectoryPage />
                </Layout>
              }
            />
            <Route
              path="/allocations"
              element={
                <Layout>
                  <AllocationPage />
                </Layout>
              }
            />
            <Route
              path="/bookings"
              element={
                <Layout>
                  <BookingPage />
                </Layout>
              }
            />
            <Route
              path="/maintenance"
              element={
                <Layout>
                  <MaintenancePage />
                </Layout>
              }
            />
            <Route
              path="/audits"
              element={
                <Layout>
                  <AuditListPage />
                </Layout>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'department_head']}>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/403"
              element={
                <Layout>
                  <UnauthorizedPage />
                </Layout>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
