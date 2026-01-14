import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { hasRole, getActiveRole, setActiveRole } from "@/lib/authStore";
import { SidebarStateProvider, useSidebarState } from "@/hooks/use-sidebar-state";

const DashboardContent = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isCA = hasRole("ca");
  const activeRole = getActiveRole();
  const { collapsed } = useSidebarState();

  const handleSwitchToRegular = () => {
    setActiveRole("regular_user");
    navigate("/dashboard");
  };

  const handleSwitchToCA = () => {
    setActiveRole("ca");
    navigate("/dashboard/ca");
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="fixed top-0 left-0 h-screen z-40">
        <DashboardSidebar />
      </div>
      <main className={`flex-1 min-w-0 overflow-x-hidden p-8 pt-20 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <Outlet />
      </main>
      {/* Top Right Controls */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        {/* Profile Toggle - Only for CA users */}
        {isCA && (
          <div className="flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={handleSwitchToRegular}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                activeRole === "regular_user"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Regular
            </button>
            <button
              onClick={handleSwitchToCA}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                activeRole === "ca"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <SidebarStateProvider>
      <DashboardContent />
    </SidebarStateProvider>
  );
};

export default DashboardLayout;
