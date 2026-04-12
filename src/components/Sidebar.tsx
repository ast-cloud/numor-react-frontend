import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Settings,
  LogOut,
  User,
  Menu,
  Calendar,
  CalendarCheck,
  Users,
  X,
} from "lucide-react";
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

type SidebarProps = {
  onMobileClose?: () => void;
};

const Sidebar = ({ onMobileClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeRole, logout } = useAuth();
  const { collapsed, toggle, setHovered, effectiveCollapsed: sidebarEffectiveCollapsed } = useSidebarState();

  // When rendered inside the mobile sheet, we treat it as "mobile".
  const inMobileSheet = typeof onMobileClose === "function";
  const effectiveCollapsed = inMobileSheet ? false : sidebarEffectiveCollapsed;

  const navItems = activeRole === "CA_USER" ? caNavItems : regularNavItems;

  const handleLogout = () => {
    logout();
    onMobileClose?.();
    navigate("/");
  };

  const handleNavClick = () => {
    if (inMobileSheet) onMobileClose?.();
  };

  return (
    <aside
      onMouseEnter={() => { if (!inMobileSheet && collapsed) setHovered(true); }}
      onMouseLeave={() => { if (!inMobileSheet) setHovered(false); }}
      className={`${inMobileSheet ? "w-full" : effectiveCollapsed ? "w-16" : "w-64"} h-screen bg-card border-r border-border flex flex-col transition-all duration-300`}
    >
      {/* Header with Logo and Controls */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!effectiveCollapsed && <h1 className="text-xl font-display font-bold text-primary">Numor</h1>}

        {inMobileSheet ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMobileClose?.()}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={`${effectiveCollapsed ? "mx-auto" : ""} text-muted-foreground hover:text-foreground`}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-border">
        <div className={`flex items-center ${effectiveCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          {!effectiveCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isExactMatch = item.url === "/sme/dashboard" || item.url === "/ca/dashboard";
            const isActive = isExactMatch ? location.pathname === item.url : location.pathname.startsWith(item.url);

            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  onClick={handleNavClick}
                  className={`flex items-center ${effectiveCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={effectiveCollapsed ? item.title : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!effectiveCollapsed && item.title}
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
            `flex items-center ${effectiveCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
          title={effectiveCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!effectiveCollapsed && "Settings"}
        </NavLink>

        <Button
          variant="ghost"
          className={`w-full ${effectiveCollapsed ? "justify-center px-0" : "justify-start gap-3"} text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
          onClick={handleLogout}
          title={effectiveCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!effectiveCollapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;


