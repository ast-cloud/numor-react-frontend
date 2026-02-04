import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatBot from "@/components/ChatBot";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExpertSignup from "./pages/ExpertSignup";
import ExpertApplicationSuccess from "./pages/ExpertApplicationSuccess";
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
import DashboardSettings from "./pages/DashboardSettings";
import CASettings from "./pages/CASettings";
import CAConnect from "./pages/CAConnect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/expert-signup" element={<ExpertSignup />} />
          <Route path="/expert-application-success" element={<ExpertApplicationSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/security" element={<Security />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/ca" element={<ForFinancialExperts />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="ca" element={<CADashboardHome />} />
            <Route path="ca/availability" element={<CAAvailability />} />
            <Route path="ca/bookings" element={<CABookings />} />
            <Route path="ca/settings" element={<CASettings />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="income" element={<Income />} />
            <Route path="income/clients" element={<Clients />} />
            <Route path="ca-connect" element={<CAConnect />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatBot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
