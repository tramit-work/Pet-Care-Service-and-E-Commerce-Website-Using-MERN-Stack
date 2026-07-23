import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';
import ShoppingPage from '../pages/ShoppingPage';
import ServicePage from '../pages/ServicePage';
import ContactPage from '../pages/ContactPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import WishlistPage from '../pages/WishlistPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminProductsPage from '../pages/AdminProductsPage';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';
import AdminPetsPage from '../pages/AdminPetsPage';
import AdminBookingsPage from '../pages/AdminBookingsPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminReviewsPage from '../pages/AdminReviewsPage';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shopping" element={<ShoppingPage />} />
        <Route path="service" element={<ServicePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute requireRole={['admin', 'editor']}>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route
          index
          element={
            <AdminProtectedRoute requireRole="admin">
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        {}
        <Route
          path="products"
          element={
            <AdminProtectedRoute requireRole={['admin', 'editor']}>
              <AdminProductsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="categories"
          element={
            <AdminProtectedRoute requireRole={['admin', 'editor']}>
              <AdminCategoriesPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="pets"
          element={
            <AdminProtectedRoute requireRole={['admin', 'editor']}>
              <AdminPetsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <AdminProtectedRoute requireRole={['admin', 'editor']}>
              <AdminBookingsPage />
            </AdminProtectedRoute>
          }
        />

        {}
        <Route
          path="orders"
          element={
            <AdminProtectedRoute requireRole="admin">
              <AdminOrdersPage />
            </AdminProtectedRoute>
          }
        />

        {}
        <Route
          path="users"
          element={
            <AdminProtectedRoute requireRole="admin">
              <AdminUsersPage />
            </AdminProtectedRoute>
          }
        />

        {}
        <Route
          path="reviews"
          element={
            <AdminProtectedRoute requireRole="admin">
              <AdminReviewsPage />
            </AdminProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
