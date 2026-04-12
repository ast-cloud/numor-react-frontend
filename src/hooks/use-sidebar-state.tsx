import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
  effectiveCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const getIsTablet = () => {
  if (typeof window === "undefined") return false;
  const w = window.innerWidth;
  return w >= 768 && w < 1024;
};

export const SidebarStateProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(() => getIsTablet());

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarState = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider");
  }
  return context;
};
