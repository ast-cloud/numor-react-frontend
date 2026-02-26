import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
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
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/ca-signup" element={<CASignup />} />
            <Route path="/ca-application-success" element={<CAApplicationSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/security" element={<Security />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/ca" element={<ForFinancialExperts />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            {/* SME Routes */}
            <Route path="/sme" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="income" element={<Income />} />
              <Route path="income/clients" element={<Clients />} />
              <Route path="ca-connect" element={<CAConnect />} />
              <Route path="settings" element={<SMESettings />} />
            </Route>
            {/* CA Routes */}
            <Route path="/ca" element={<ProtectedRoute><RoleGuard role="CA_USER"><DashboardLayout /></RoleGuard></ProtectedRoute>}>
              <Route path="dashboard" element={<CADashboardHome />} />
              <Route path="availability" element={<CAAvailability />} />
              <Route path="bookings" element={<CABookings />} />
              <Route path="settings" element={<CASettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
