import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { SidebarStateProvider, useSidebarState } from "@/hooks/use-sidebar-state";
import { CAProfileProvider } from "@/hooks/use-ca-profile";
import ChatBot from "@/components/ChatBot";

const DashboardContent = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { hasRole, activeRole, setActiveRole } = useAuth();
  const isCA = hasRole("CA_USER");
  const { collapsed, mobileOpen, toggleMobile } = useSidebarState();

  const handleSwitchToRegular = () => {
    setActiveRole("SME_USER");
    navigate("/sme/dashboard");
  };

  const handleSwitchToCA = () => {
    setActiveRole("CA_USER");
    navigate("/ca/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="fixed top-0 left-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* Main content — no left margin on mobile, sidebar-aware on desktop */}
      <main className={`flex-1 min-w-0 overflow-x-hidden p-8 pt-20 transition-all duration-300 ml-0 md:${collapsed ? "ml-16" : "ml-64"}`}>
        <Outlet />
      </main>

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        {/* Role toggle — CA users only */}
        {isCA && (
          <div className="flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={handleSwitchToRegular}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ease-in-out ${
                activeRole === "SME_USER"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Regular
            </button>
            <button
              onClick={handleSwitchToCA}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ease-in-out ${
                activeRole === "CA_USER"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              CA
            </button>
          </div>
        )}
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile hamburger — top-left, hidden on desktop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden text-muted-foreground hover:text-foreground"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <ChatBot />
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <CAProfileProvider>
      <SidebarStateProvider>
        <DashboardContent />
      </SidebarStateProvider>
    </CAProfileProvider>
  );
};

export default DashboardLayout;
