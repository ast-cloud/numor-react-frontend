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
  { title: "Dashboard", url: "/sme/dashboard", icon: LayoutDashboard, module: "dashboard" as const },
  { title: "Expenses", url: "/sme/expenses", icon: Receipt, module: "expense" as const },
  { title: "Income", url: "/sme/income", icon: FileText, module: "income" as const },
  { title: "CA Connect", url: "/sme/ca-connect", icon: Users, module: null },
];

const caNavItems = [
  { title: "Dashboard", url: "/ca/dashboard", icon: LayoutDashboard, module: null },
  { title: "Availability", url: "/ca/availability", icon: Calendar, module: null },
  { title: "Bookings", url: "/ca/bookings", icon: CalendarCheck, module: null },
];

type SidebarProps = {
  onMobileClose?: () => void;
};

const Sidebar = ({ onMobileClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeRole, logout, isSubAccount, can } = useAuth();
  const { collapsed, toggle, setHovered, effectiveCollapsed: sidebarEffectiveCollapsed } = useSidebarState();

  const inMobileSheet = typeof onMobileClose === "function";
  const effectiveCollapsed = inMobileSheet ? false : sidebarEffectiveCollapsed;

  const baseItems = activeRole === "CA_USER" ? caNavItems : regularNavItems;
  const navItems = isSubAccount
    ? baseItems.filter((it) => it.module !== null && can(it.module, "read"))
    : baseItems;
  const showSettings = !isSubAccount || can("settings", "read");

  const handleLogout = () => {
    logout();
    onMobileClose?.();
    navigate("/");
  };

  const handleNavClick = () => {
    if (inMobileSheet) onMobileClose?.();
  };

  // Label fades; icons stay anchored at the same x in both states.
  const labelClass = `whitespace-nowrap transition-opacity duration-200 ${
    effectiveCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
  }`;

  return (
    <aside
      onMouseLeave={() => { if (!inMobileSheet) setHovered(false); }}
      className={`${inMobileSheet ? "w-full" : effectiveCollapsed ? "w-16" : "w-64"} h-screen bg-card border-r border-border flex flex-col transition-[width] duration-300 overflow-hidden`}
    >
      {/* Header with Logo and Controls — fixed left padding so toggle stays put */}
      <div className="h-16 px-3 border-b border-border flex items-center gap-3">
        {inMobileSheet ? (
          <>
            <h1 className="text-xl font-display font-bold text-primary">Numor</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMobileClose?.()}
              className="ml-auto text-muted-foreground hover:text-foreground"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="text-muted-foreground hover:text-foreground w-10 h-10 flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className={`text-xl font-display font-bold text-primary ${labelClass}`}>Numor</h1>
          </>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className={`flex-1 min-w-0 ${labelClass}`}>
            <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Hoverable area (excludes header and profile) */}
      <div
        className="flex flex-col flex-1 min-h-0"
        onMouseEnter={() => { if (!inMobileSheet && collapsed) setHovered(true); }}
      >
        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isExactMatch = item.url === "/sme/dashboard" || item.url === "/ca/dashboard";
              const isActive = isExactMatch ? location.pathname === item.url : location.pathname.startsWith(item.url);

              return (
                <li key={item.title}>
                  <NavLink
                    to={item.url}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 h-10 px-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title={effectiveCollapsed ? item.title : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={labelClass}>{item.title}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section: Settings & Logout */}
        <div className="p-3 border-t border-border space-y-1">
          {showSettings && (
          <NavLink
            to={activeRole === "CA_USER" ? "/ca/settings" : "/sme/settings"}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 h-10 px-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
            title={effectiveCollapsed ? "Organization Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={labelClass}>Organization Settings</span>
          </NavLink>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={effectiveCollapsed ? "Logout" : undefined}
            className="flex items-center gap-3 h-10 px-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={labelClass}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
