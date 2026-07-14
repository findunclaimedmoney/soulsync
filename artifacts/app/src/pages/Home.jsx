import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Landing from "@/pages/Landing";
import UserDashboard from "@/pages/UserDashboard";

export default function Home() {
  const { isAuthenticated, user, isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Admins → admin dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Logged-in regular users → personalised home
  if (isAuthenticated) {
    return <UserDashboard />;
  }

  // Guests → marketing landing page
  return <Landing />;
}