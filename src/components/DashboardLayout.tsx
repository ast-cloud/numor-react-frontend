import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  const { effectiveCollapsed: collapsed } = useSidebarState();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      {/* Desktop / Tablet sidebar stays as-is */}
      <div className="fixed top-0 left-0 h-screen z-40 hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile: sidebar is fully off-canvas */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[18rem] p-0 bg-card text-card-foreground [&>button]:hidden md:hidden"
        >
          <Sidebar onMobileClose={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-muted-foreground hover:text-foreground"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <main
        className={`flex-1 min-w-0 overflow-x-hidden px-4 md:px-8 pb-4 md:pb-8 pt-20 transition-all duration-300 ml-0 ${collapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        <Outlet />
      </main>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        {/* Profile Toggle - Only for CA users */}
        {isCA && (
          <div className="flex items-center bg-muted rounded-full p-0.5 group/switch">
            <button
              onClick={handleSwitchToRegular}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ease-in-out ${
                activeRole === "SME_USER"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105 hover:scale-[1.08] hover:shadow-md"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 hover:scale-[1.03]"
              }`}
            >
              Regular
            </button>
            <button
              onClick={handleSwitchToCA}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ease-in-out ${
                activeRole === "CA_USER"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105 hover:scale-[1.08] hover:shadow-md"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 hover:scale-[1.03]"
              }`}
            >
              CA
            </button>
          </div>
        )}

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

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

