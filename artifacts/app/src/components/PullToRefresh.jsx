import React, { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";

const THRESHOLD = 70;
const MAX_PULL = 100;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef(null);
  const refreshingRef = useRef(false);
  const pullingRef = useRef(false);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  // Detects whether the touch started at the top of the nearest scrollable
  // ancestor (or window). In Chat.jsx the scroll container is a nested
  // overflow-y-auto div, so window.scrollY is always 0 — checking it would
  // make pull-to-refresh fire even when the user is scrolled down.
  const isAtScrollTop = useCallback(() => {
    let el = containerRef.current?.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight) {
        return el.scrollTop <= 0;
      }
      el = el.parentElement;
    }
    return window.scrollY <= 0;
  }, []);

  const onTouchStart = useCallback((e) => {
    if (refreshingRef.current) return;
    if (!isAtScrollTop()) return;
    startY.current = e.touches[0].clientY;
    pullingRef.current = true;
    pulling.current = true;
  }, [isAtScrollTop]);

  const onTouchMove = useCallback((e) => {
    if (!pullingRef.current || refreshingRef.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) return;
    // Prevent default so Android WebView overscroll doesn't take over the gesture
    if (e.cancelable) e.preventDefault();
    const resisted = Math.min(delta * 0.5, MAX_PULL);
    setPullDistance(resisted);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    pulling.current = false;
    setPullDistance((cur) => {
      if (cur >= THRESHOLD) {
        setRefreshing(true);
        (async () => {
          try {
            await onRefresh();
          } catch (err) {
            console.error(err);
          } finally {
            setRefreshing(false);
            setPullDistance(0);
          }
        })();
        return THRESHOLD;
      }
      return 0;
    });
  }, [onRefresh]);

  // Attach non-passive touchmove listener so preventDefault works on Android
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  return (
    <div ref={containerRef}>
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance,
          opacity: pullDistance / THRESHOLD,
        }}
      >
        {refreshing ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <ChevronDown
            className="w-5 h-5 text-muted-foreground transition-transform"
            style={{ transform: pullDistance >= THRESHOLD ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        )}
      </div>
      {children}
    </div>
  );
}