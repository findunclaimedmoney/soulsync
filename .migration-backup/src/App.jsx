import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Lazy-loaded pages — splits the bundle so the initial load is minimal
const PageNotFound = React.lazy(() => import('./lib/PageNotFound'));
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Games = React.lazy(() => import('./pages/Games'));
const CreateCompanion = React.lazy(() => import('./pages/CreateCompanion'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Features = React.lazy(() => import('./pages/Features'));
const Manual = React.lazy(() => import('./pages/Manual'));
const Notes = React.lazy(() => import('./pages/Notes'));
const AvatarLanding = React.lazy(() => import('./pages/AvatarLanding'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const VipLounge = React.lazy(() => import('./pages/VipLounge'));
const ZacLanding = React.lazy(() => import('./pages/ZacLanding'));
const ZacConfidentLanding = React.lazy(() => import('./pages/ZacConfidentLanding'));
const JessLanding = React.lazy(() => import('./pages/JessLanding'));
const JessicaLanding = React.lazy(() => import('./pages/JessicaLanding'));
const MonicaLanding = React.lazy(() => import('./pages/MonicaLanding'));
const MiaLanding = React.lazy(() => import('./pages/MiaLanding'));
const CompanionProfile = React.lazy(() => import('./pages/CompanionProfile'));
const MarketingHub = React.lazy(() => import('./pages/MarketingHub'));
const CryptoPayment = React.lazy(() => import('./pages/CryptoPayment'));
const CompanionLanding = React.lazy(() => import('./pages/CompanionLanding'));
const CompanionApply = React.lazy(() => import('./pages/CompanionApply'));
const CompanionHub = React.lazy(() => import('./pages/CompanionHub'));
const PromoAdmin = React.lazy(() => import('./pages/PromoAdmin'));
const CompanionSetup = React.lazy(() => import('./pages/CompanionSetup'));

const HealthCheck = React.lazy(() => import('./pages/HealthCheck'));
const MoonPayReturn = React.lazy(() => import('./pages/MoonPayReturn'));
const Legal = React.lazy(() => import('./pages/Legal'));
const FbOffer = React.lazy(() => import('./pages/FbOffer'));
const JessOffer = React.lazy(() => import('./pages/JessOffer'));
const VoicePreview = React.lazy(() => import('./pages/VoicePreview'));
const CampaignReview = React.lazy(() => import('./pages/CampaignReview'));
const MarketingDashboard = React.lazy(() => import('./pages/MarketingDashboard'));
const Account = React.lazy(() => import('./pages/Account'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
import ProtectedRoute from '@/components/ProtectedRoute';
import MobileShell from '@/components/MobileShell';

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors — any auth failure redirects to login
  // (user_not_registered shows a dedicated error screen instead)
  // BUT: if already on an auth page (login, register, etc.), let it render
  // so the user can re-authenticate — otherwise we loop endlessly redirecting
  // to /login without ever rendering the login page.
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (!isAuthRoute) {
      return <Navigate to="/login" replace />;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<MobileShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/avatar-landing" element={<AvatarLanding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/moonpay" element={<MoonPayReturn />} />
        <Route path="/legal" element={<Legal />} />
      <Route path="/fb-offer" element={<FbOffer />} />
      <Route path="/jess-offer" element={<JessOffer />} />
      <Route path="/voice-preview" element={<VoicePreview />} />
      <Route path="/campaign-review" element={<CampaignReview />} />
      <Route path="/marketing-dashboard" element={<MarketingDashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/vip-lounge" element={<VipLounge />} />
        <Route path="/zac" element={<ZacConfidentLanding />} />
        <Route path="/zac-steady" element={<ZacLanding />} />
        <Route path="/jess" element={<JessLanding />} />
      <Route path="/jessica" element={<JessicaLanding />} />
      <Route path="/monica" element={<MonicaLanding />} />
      <Route path="/mia" element={<MiaLanding />} />
      <Route path="/companion/:slug" element={<CompanionProfile />} />
        <Route path="/marketing" element={<CampaignReview />} />
        <Route path="/mia-marketing" element={<MarketingHub />} />
        <Route path="/crypto" element={<CryptoPayment />} />
        <Route path="/companions" element={<CompanionLanding />} />
        <Route path="/companion-apply" element={<CompanionApply />} />
        <Route path="/companion-hub" element={<CompanionHub />} />
        <Route path="/promo-admin" element={<PromoAdmin />} />
      <Route path="/create-companion" element={<CompanionSetup />} />

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/chat/:companionId" element={<Chat />} />
          <Route path="/games" element={<Games />} />
          <Route path="/create" element={<CreateCompanion />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App