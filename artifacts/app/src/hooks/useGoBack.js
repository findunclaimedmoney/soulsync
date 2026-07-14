import { useNavigate } from "react-router-dom";

/**
 * Unified back navigation for Android WebView back-stack integrity.
 * Falls back to the given route when there's no history to pop.
 */
export function useGoBack(fallback = "/") {
  const navigate = useNavigate();
  return () => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}