import React, { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gamepad2, NotebookPen, CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const TABS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/games", icon: Gamepad2, label: "Games" },
  { to: "/notes", icon: NotebookPen, label: "Notes" },
  { to: "/pricing", icon: CreditCard, label: "Plans" },
];

export const ROOT_PATHS = new Set(TABS.map((t) => t.to));

export default function MobileBottomTabs() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const histories = useRef({});

  // Determine which tab is currently active based on root path
  const currentRoot = ROOT_PATHS.has(location.pathname) ? location.pathname : null;

  // Persist the current location into the active tab's history as it changes
  useEffect(() => {
    if (currentRoot) {
      histories.current[currentRoot] = location.pathname;
    }
  }, [location.pathname, currentRoot]);

  if (!isMobile) return null;

  const handleTabClick = (tab) => {
    const isActive = currentRoot === tab.to;
    if (isActive) {
      // Re-selecting the active tab — scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Switching to a different tab — restore its saved route or navigate to root
      const saved = histories.current[tab.to];
      navigate(saved || tab.to);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-card/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const isActive = currentRoot === tab.to;
        return (
          <button
            key={tab.to}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2.5 px-4 transition-colors select-none ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium select-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}