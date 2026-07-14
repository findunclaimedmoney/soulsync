import React from "react";

const APP_STORE_URL = "https://apps.apple.com/app/glimr"; // update with real URL when live
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.base44.glimr"; // update with real URL when live

export default function MobileAppBadges({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black border border-white/15 hover:border-white/30 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
          <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.27 3.14-2.53.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.75-4.13zM14.6 4.59c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.08 3.18 1.15.09 2.31-.59 3.03-1.45z"/>
        </svg>
        <div className="text-left leading-none">
          <p className="text-[9px] text-white/70 uppercase tracking-wide">Download on the</p>
          <p className="text-sm font-semibold text-white">App Store</p>
        </div>
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black border border-white/15 hover:border-white/30 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path d="M3.18 2.5c-.18.2-.28.5-.28.86v17.28c0 .36.1.66.28.86l.05.04L12 12.18v-.36L3.23 2.46l-.05.04z" fill="#EA4335"/>
          <path d="M15.35 15.5L12 12.18v-.36l3.35-3.32.08.05 3.97 2.26c1.14.65 1.14 1.71 0 2.36l-3.97 2.26-.08.05z" fill="#FBBC04"/>
          <path d="M15.43 15.45L12 12.18 3.18 20.5c.37.4.99.45 1.7.05l10.55-6z" fill="#34A853"/>
          <path d="M15.43 8.91L4.88 2.96c-.71-.4-1.33-.35-1.7.05L12 12.18l3.43-3.27z" fill="#4285F4"/>
        </svg>
        <div className="text-left leading-none">
          <p className="text-[9px] text-white/70 uppercase tracking-wide">Get it on</p>
          <p className="text-sm font-semibold text-white">Google Play</p>
        </div>
      </a>
    </div>
  );
}