import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomTabs, { ROOT_PATHS } from "@/components/MobileBottomTabs";
import SettingsModal from "@/components/SettingsModal";
import SupportChatWidget from "@/components/SupportChatWidget";
import { useGoBack } from "@/hooks/useGoBack";

const SKIP_HEADER_PATTERNS = [
  /^\/$/,
  /^\/chat\//,
  /^\/zac$/,
  /^\/jess$/,
  /^\/companions$/,
  /^\/avatar-landing$/,
  /^\/health$/,
  /^\/dashboard$/,
];

function shouldSkipHeader(pathname) {
  return SKIP_HEADER_PATTERNS.some((p) => p.test(pathname));
}

export default function MobileShell() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const goBack = useGoBack();

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onChange = () => {
      setKeyboardOpen(vv.height < window.innerHeight * 0.75);
    };
    vv.addEventListener("resize", onChange);
    onChange();
    return () => vv.removeEventListener("resize", onChange);
  }, []);

  if (!isMobile) {
    return (
      <>
        <Outlet />
        {!location.pathname.startsWith("/chat/") && <SupportChatWidget />}
      </>
    );
  }

  const rootView = ROOT_PATHS.has(location.pathname);
  const skipHeader = shouldSkipHeader(location.pathname);
  const showHeader = !skipHeader;
  const showBack = !rootView && !skipHeader;
const showTabs = rootView && !keyboardOpen;
  return (
    <>
      {showHeader && (
        <header
          className="sticky top-0 z-50 flex items-center justify-between px-4 border-b border-border bg-card/95 backdrop-blur-md"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
        >
          {showBack ? (
            <button
onClick={goBack}              className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-foreground hover:text-primary transition-colors select-none"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
                alt="GLIMR"
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-heading text-lg font-semibold text-primary">GLIMR</span>
            </Link>
          )}
          {showHeader && !showBack && (
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground select-none"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </header>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      {showTabs && <MobileBottomTabs />}
      {!location.pathname.startsWith("/chat/") && <SupportChatWidget />}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}