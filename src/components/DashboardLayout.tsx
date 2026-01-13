import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeftRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { hasRole, getActiveRole, setActiveRole } from "@/lib/authStore";

const DashboardLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isCA = hasRole("ca");
  const activeRole = getActiveRole();

  const handleSwitchProfile = () => {
    if (activeRole === "ca") {
      setActiveRole("regular_user");
      navigate("/dashboard");
    } else {
      setActiveRole("ca");
      navigate("/dashboard/ca");
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden p-8 pt-14">
        <Outlet />
      </main>
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Profile Switcher - Only for CA users */}
        {isCA && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchProfile}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">
              Switch to {activeRole === "ca" ? "Regular User" : "CA"}
            </span>
          </Button>
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

export default DashboardLayout;
