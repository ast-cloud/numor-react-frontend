import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, FileText, Settings, LogOut, User, Menu, Calendar, CalendarCheck, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useSidebarState } from "@/hooks/use-sidebar-state";

const regularNavItems = [
  { title: "Dashboard", url: "/sme/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/sme/expenses", icon: Receipt },
  { title: "Income", url: "/sme/income", icon: FileText },
  { title: "CA Connect", url: "/sme/ca-connect", icon: Users },
];

const caNavItems = [
  { title: "Dashboard", url: "/ca/dashboard", icon: LayoutDashboard },
  { title: "Availability", url: "/ca/availability", icon: Calendar },
  { title: "Bookings", url: "/ca/bookings", icon: CalendarCheck },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeRole, logout } = useAuth();
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebarState();

  const navItems = activeRole === "CA_USER" ? caNavItems : regularNavItems;

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate("/");
  };

  const handleNavClick = () => {
    closeMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          h-screen bg-card border-r border-border flex flex-col transition-all duration-300
          fixed top-0 left-0 z-40
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-64
          md:translate-x-0 md:${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Header with Logo and Hamburger */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-display font-bold text-primary">Numor</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={`${collapsed ? "mx-auto" : ""} text-muted-foreground hover:text-foreground hidden md:flex`}
          >
            <Menu className="w-5 h-5" />
          </Button>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobile}
            className="text-muted-foreground hover:text-foreground md:hidden ml-auto"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-border">
          <div className={`flex items-center ${collapsed ? "md:justify-center" : "gap-3"}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className={`flex-1 min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isExactMatch = item.url === "/sme/dashboard" || item.url === "/ca/dashboard";
              const isActive = isExactMatch
                ? location.pathname === item.url
                : location.pathname.startsWith(item.url);

              return (
                <li key={item.title}>
                  <NavLink
                    to={item.url}
                    onClick={handleNavClick}
                    className={`flex items-center ${collapsed ? "md:justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title={collapsed ? item.title : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={collapsed ? "md:hidden" : ""}>{item.title}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section: Settings & Logout */}
        <div className="p-4 border-t border-border space-y-1">
          <NavLink
            to={activeRole === "CA_USER" ? "/ca/settings" : "/sme/settings"}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? "md:justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>Settings</span>
          </NavLink>
          <Button
            variant="ghost"
            className={`w-full ${collapsed ? "md:justify-center md:px-0" : "justify-start gap-3"} text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
