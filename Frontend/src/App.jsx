import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// ==================== AUTHENTICATION ====================
import ProtectedRoute from "./pages/authentication/ProtectedRoute";
import Signup from "./pages/authentication/Signup";
import LoginPage from "./pages/authentication/LoginPage";
import BecomeProviderPage from "./pages/authentication/BecomeProviderpage";

// ==================== CUSTOMER LAYOUT ====================
import Layout from "./components/CustomerPage/Layout";
import CustomerLayout from "./pages/CustomerDashboard/CustomerLayout";

// ==================== CUSTOMER PAGES ====================
import HomePage from "./pages/CustomerDashboard/HomePage";
import SearchPage from "./pages/CustomerDashboard/SearchPage";
import CategoriesPage from "./pages/CustomerDashboard/CategoriesPage";
import ServicesPage from "./pages/CustomerDashboard/ServicesPage";
import ProvidersPage from "./pages/CustomerDashboard/ProvidersPage";
import ProviderProfilePage from "./pages/CustomerDashboard/ProviderProfilePage";
import AIMatchingPage from "./pages/CustomerDashboard/AIMatchingPage";
import NearbyMapPage from "./pages/CustomerDashboard/NearbyMapPage";

import BookingFormPage from "./pages/CustomerDashboard/BookingFormPage";
import BookingHistoryPage from "./pages/CustomerDashboard/BookingHistoryPage";
import BookingDetailPage from "./pages/CustomerDashboard/BookingDetailPage";
import ServiceRequestDetailPage from "./pages/CustomerDashboard/ServiceRequestDetailPage";
import PaymentCallbackPage from "./pages/CustomerDashboard/PaymentCallbackPage";
import KhaltiSandboxPage from "./pages/CustomerDashboard/KhaltiSandboxPage";

import CustomerProfile from "./pages/CustomerDashboard/CustomerProfile";
import CustomerSettings from "./pages/CustomerDashboard/CustomerSettings";

// ==================== PROVIDER LAYOUT ====================
import ProviderLayout from "./pages/ProviderDashboard/ProviderLayout";

// ==================== PROVIDER PAGES ====================
import ProviderDashboard from "./pages/ProviderDashboard/ProviderDashboard";
import ManageBookings from "./pages/ProviderDashboard/ManageBookings";
import ManageServiceRequests from "./pages/ProviderDashboard/ManageServiceRequests";
import ManageServices from "./pages/ProviderDashboard/ManageServices";
import Availability from "./pages/ProviderDashboard/Availability";
import Earnings from "./pages/ProviderDashboard/Earnings";
import ProviderProfile from "./pages/ProviderDashboard/ProviderProfile";
import Reviews from "./pages/ProviderDashboard/Reviews";
import Settings from "./pages/ProviderDashboard/Settings";

// ==================== ADMIN LAYOUT ====================
import AdminLayout from "./pages/adminDashboard/AdminLayout";

// ==================== ADMIN PAGES ====================
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import AdminApplications from "./pages/adminDashboard/AdminApplications";
import AdminUsers from "./pages/adminDashboard/AdminUsers";
import AdminBookings from "./pages/adminDashboard/AdminBookings";
import AdminEarnings from "./pages/adminDashboard/AdminEarnings";

function RootLanding() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const role = String(user?.role || "").toLowerCase();

  if (role === "provider") {
    return <Navigate to="/provider/dashboard" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <HomePage />;
}


function App() {
  return (
    <Routes>

      {/* =====================================================
          AUTHENTICATION
      ===================================================== */}

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/become-provider"
        element={<BecomeProviderPage />}
      />

      {/* Backward-compatible route */}
      <Route
        path="/becomeprovider"
        element={<BecomeProviderPage />}
      />


      {/* =====================================================
          PROVIDER DASHBOARD
      ===================================================== */}

      <Route
        path="/provider"
        element={
          <ProtectedRoute roles={["provider", "admin"]}>
            <ProviderLayout />
          </ProtectedRoute>
        }
      >

        {/* Provider Dashboard — redirect index to /provider/dashboard */}
        <Route
          index
          element={<Navigate to="/provider/dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<ProviderDashboard />}
        />

        {/* Bookings */}
        <Route
          path="bookings"
          element={<ManageBookings />}
        />

        {/* Inspection-Based Service Requests */}
        <Route
          path="service-requests"
          element={<ManageServiceRequests />}
        />

        {/* Provider Services */}
        <Route
          path="services"
          element={<ManageServices />}
        />

        {/* Provider Profile */}
        <Route
          path="profile"
          element={<ProviderProfile />}
        />

        {/* Availability */}
        <Route
          path="availability"
          element={<Availability />}
        />

        {/* Earnings */}
        <Route
          path="earnings"
          element={<Earnings />}
        />

        {/* Reviews */}
        <Route
          path="reviews"
          element={<Reviews />}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<Settings />}
        />

      </Route>


      {/* =====================================================
          ADMIN DASHBOARD
      ===================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* Admin Dashboard */}
        <Route
          index
          element={<AdminDashboard />}
        />

        {/* Provider Applications */}
        <Route
          path="applications"
          element={<AdminApplications />}
        />

        {/* Users */}
        <Route
          path="users"
          element={<AdminUsers />}
        />

        {/* Bookings */}
        <Route
          path="bookings"
          element={<AdminBookings />}
        />

        {/* Platform Earnings */}
        <Route
          path="earnings"
          element={<AdminEarnings />}
        />

      </Route>


      {/* =====================================================
          CUSTOMER DASHBOARD
      ===================================================== */}

      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={["customer"]}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >

        {/* Default customer page */}
        <Route
          index
          element={
            <Navigate
              to="/customer/profile"
              replace
            />
          }
        />

        {/* Bookings */}
        <Route
          path="bookings"
          element={<BookingHistoryPage />}
        />

        <Route
          path="bookings/:bookingId"
          element={<BookingDetailPage />}
        />

        {/* Inspection-Based Service Requests */}
        <Route
          path="service-requests/:requestId"
          element={<ServiceRequestDetailPage />}
        />

        {/* Profile */}
        <Route
          path="profile"
          element={<CustomerProfile />}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<CustomerSettings />}
        />

      </Route>


      {/* =====================================================
          PUBLIC CUSTOMER / MARKETPLACE
      ===================================================== */}

      <Route
        path="/"
        element={<Layout />}
      >

        {/* Home */}
        <Route
          index
          element={<RootLanding />}
        />

        {/* Search */}
        <Route
          path="search"
          element={<SearchPage />}
        />

        {/* Categories */}
        <Route
          path="categories"
          element={<CategoriesPage />}
        />

        {/* Services inside a category
            Example:
            /categories/electrical
        */}
        <Route
          path="categories/:categoryId"
          element={<ServicesPage />}
        />

        {/* Providers
            Used for providers matching a selected service
        */}
        <Route
          path="providers"
          element={<ProvidersPage />}
        />

        {/* Provider Profile */}
        <Route
          path="providers/:providerId"
          element={<ProviderProfilePage />}
        />

        {/* AI Matching */}
        <Route
          path="ai-match"
          element={<AIMatchingPage />}
        />

        {/* Map Radar */}
        <Route
          path="map"
          element={<NearbyMapPage />}
        />

        {/* =================================================
            CATEGORY A — FIXED PRICE BOOKING
        ================================================= */}

        <Route
          path="book/:providerId"
          element={
            <ProtectedRoute>
              <BookingFormPage />
            </ProtectedRoute>
          }
        />

        {/* Existing booking routes */}
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <BookingHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="bookings/:bookingId"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PAYMENT CALLBACK & SANDBOX
        ================================================= */}

        <Route
          path="payment/callback"
          element={
            <ProtectedRoute>
              <PaymentCallbackPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="payment/sandbox"
          element={
            <ProtectedRoute>
              <KhaltiSandboxPage />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;