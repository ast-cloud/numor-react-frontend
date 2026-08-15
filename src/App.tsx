import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { FeatureFlagsProvider } from "@/hooks/use-feature-flags";
import FeatureFlagGuard from "@/components/FeatureFlagGuard";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CASignup from "./pages/CASignup";
import CAApplicationSuccess from "./pages/CAApplicationSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Security from "./pages/Security";
import Compliance from "./pages/Compliance";
import Pricing from "./pages/Pricing";
import ForFinancialExperts from "./pages/ForFinancialExperts";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import CADashboardHome from "./pages/CADashboardHome";
import CAAvailability from "./pages/CAAvailability";
import CABookings from "./pages/CABookings";
import AdminDashboard from "./pages/AdminDashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Clients from "./pages/Clients";
import SMESettings from "./pages/SMESettings";
import CASettings from "./pages/CASettings";
import CAConnect from "./pages/CAConnect";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import PermissionGuard from "./components/PermissionGuard";
import NoAccess from "./pages/NoAccess";
import AcceptInvitation from "./pages/AcceptInvitation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FeatureFlagsProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/ca-signup" element={<FeatureFlagGuard flag="FF_CA_CORE"><CASignup /></FeatureFlagGuard>} />
            <Route path="/ca-application-success" element={<FeatureFlagGuard flag="FF_CA_CORE"><CAApplicationSuccess /></FeatureFlagGuard>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/security" element={<Security />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/ca" element={<ForFinancialExperts />} />
            <Route path="/admin" element={<ProtectedRoute><RoleGuard role="ADMIN"><AdminDashboard /></RoleGuard></ProtectedRoute>} />
            {/* SME Routes */}
            <Route path="/sme" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PermissionGuard module="dashboard"><DashboardHome /></PermissionGuard>} />
              <Route path="expenses" element={<PermissionGuard module="expense"><Expenses /></PermissionGuard>} />
              <Route path="income" element={<PermissionGuard module="income"><Income /></PermissionGuard>} />
              <Route path="income/clients" element={<PermissionGuard module="income"><Clients /></PermissionGuard>} />
              <Route path="ca-connect" element={<RoleGuard role="SME_USER"><FeatureFlagGuard flag="FF_CA_CORE"><CAConnect /></FeatureFlagGuard></RoleGuard>} />
              <Route path="settings" element={<SMESettings />} />
              <Route path="no-access" element={<NoAccess />} />
            </Route>
            {/* CA Routes */}
            <Route path="/ca" element={<ProtectedRoute><RoleGuard role="CA_USER"><FeatureFlagGuard flag="FF_CA_CORE"><DashboardLayout /></FeatureFlagGuard></RoleGuard></ProtectedRoute>}>
              <Route path="dashboard" element={<CADashboardHome />} />
              <Route path="availability" element={<CAAvailability />} />
              <Route path="bookings" element={<CABookings />} />
              <Route path="settings" element={<CASettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </AuthProvider>
        </FeatureFlagsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
