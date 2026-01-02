import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Receipt, FileText, Settings, LogOut, User, Menu } from "lucide-react";
import { logoutUser, getCurrentUser } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/dashboard/expenses", icon: Receipt },
  { title: "Income", url: "/dashboard/income", icon: FileText },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} h-screen bg-card border-r border-border flex flex-col transition-all duration-300`}>
      {/* Header with Logo and Hamburger */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-display font-bold text-primary">Numor</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={`${collapsed ? "mx-auto" : ""} text-muted-foreground hover:text-foreground`}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-border">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section: Settings & Logout */}
      <div className="p-4 border-t border-border space-y-1">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && "Settings"}
        </NavLink>
        <Button
          variant="ghost"
          className={`w-full ${collapsed ? "justify-center px-0" : "justify-start gap-3"} text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
