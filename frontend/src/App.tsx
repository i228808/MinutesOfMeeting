import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import { API_URL } from './config';
// Eager load Landing Page for LCP
import LandingPage from './pages/LandingPage';

// Lazy load other pages for Performance (Code Splitting)
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const MeetingsPage = lazy(() => import('./pages/MeetingsPage'));
const MeetingDetailPage = lazy(() => import('./pages/MeetingDetailPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const ContractEditorPage = lazy(() => import('./pages/ContractEditorPage'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const GDPRPage = lazy(() => import('./pages/GDPRPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage'));
const PressPage = lazy(() => import('./pages/PressPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));

// Body class controller for proper scrolling behavior
function BodyClassController() {
  const location = useLocation();

  useEffect(() => {
    const isDashboard = location.pathname.startsWith('/dashboard');

    if (isDashboard) {
      document.body.classList.remove('landing-page');
      document.body.classList.add('dashboard-page');
    } else {
      document.body.classList.add('landing-page');
      document.body.classList.remove('dashboard-page');
    }
  }, [location]);

  return null;
}

// Auth guard component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// OAuth callback handler
function AuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem('token', token);
    // Fetch user data
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        window.location.href = '/dashboard';
      })
      .catch(() => {
        window.location.href = '/dashboard';
      });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-bg-base)' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
    </div>
  );
}

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <BodyClassController />
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0A0A0C' }}>
            <Loader2 size={32} color="#FF6B4A" className="animate-spin" />
          </div>
        }>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Static pages */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="/gdpr" element={<GDPRPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/press" element={<PressPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <DashboardOverview />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/meetings"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <MeetingsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/meetings/:id"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <MeetingDetailPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/upload"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <UploadPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/contracts"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ContractsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/contracts/:id"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ContractEditorPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/calendar"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <CalendarPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/reminders"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <RemindersPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/subscription"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SubscriptionPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/teams"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <TeamsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/teams/:id"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <TeamDetailPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster theme="dark" position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
