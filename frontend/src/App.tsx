import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { API_URL } from './config';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import MeetingsPage from './pages/MeetingsPage';
import MeetingDetailPage from './pages/MeetingDetailPage';
import UploadPage from './pages/UploadPage';
import CalendarPage from './pages/CalendarPage';
import ContractsPage from './pages/ContractsPage';
import ContractEditorPage from './pages/ContractEditorPage';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import GDPRPage from './pages/GDPRPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import DocsPage from './pages/DocsPage';
import HelpPage from './pages/HelpPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import IntegrationsPage from './pages/IntegrationsPage';
import StatusPage from './pages/StatusPage';
import ChangelogPage from './pages/ChangelogPage';
import ContactPage from './pages/ContactPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';

import PressPage from './pages/PressPage';

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
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Static pages */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
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
        <Toaster theme="dark" position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
