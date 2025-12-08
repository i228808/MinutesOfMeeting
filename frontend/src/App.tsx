import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
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

// Auth guard component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
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
    fetch('http://localhost:5000/api/auth/me', {
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0c0c0f' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#d97706', borderRadius: '50%' }} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme="dark" position="top-right" />
    </BrowserRouter>
  );
}

export default App;
