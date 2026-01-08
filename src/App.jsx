import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load all pages for code splitting
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const ExamEngine = lazy(() => import('./pages/dashboard/ExamEngine'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const Leaderboard = lazy(() => import('./pages/dashboard/Leaderboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Onboarding = lazy(() => import('./pages/auth/Onboarding'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const QuestionManager = lazy(() => import('./pages/admin/QuestionManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const StudyBricks = lazy(() => import('./pages/dashboard/StudyBricks'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route Component - requires authentication
const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Redirect to onboarding if profile not complete
  if (user?.profileComplete === false) return <Navigate to="/onboarding" replace />;
  return children;
};

// Admin Route Component - requires admin role
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Only allow admin role
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard/exam-engine" replace />;
  }
  return children;
};

// Onboarding Route - only for users who need to complete profile
const OnboardingRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // If profile is already complete, redirect to dashboard
  if (user?.profileComplete !== false) return <Navigate to="/dashboard/exam-engine" replace />;
  return children;
};

// Subscription Guard - checks if user has active subscription
const SubscriptionRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Check subscription status
  if (user?.status !== 'active') {
    return <Navigate to="/dashboard/profile" replace />;
  }

  // Check plan expiry
  if (user?.planExpiry) {
    const expiry = user.planExpiry.toDate ? user.planExpiry.toDate() : new Date(user.planExpiry);
    if (expiry < new Date()) {
      return <Navigate to="/dashboard/profile" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/onboarding" element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              } />
              {/* SECURITY: /seed route removed - use Firebase Console for seeding */}

              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                {/* Admin Routes - Protected by AdminRoute */}
                <Route path="admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="admin/questions" element={<AdminRoute><QuestionManager /></AdminRoute>} />
                <Route path="admin/users" element={<AdminRoute><UserManager /></AdminRoute>} />

                {/* Student/User Routes - Protected by SubscriptionRoute */}
                <Route path="dashboard/exam-engine" element={<SubscriptionRoute><ExamEngine /></SubscriptionRoute>} />
                <Route path="dashboard/study-bricks" element={<SubscriptionRoute><StudyBricks /></SubscriptionRoute>} />
                <Route path="dashboard/leaderboard" element={<Leaderboard />} />
                <Route path="dashboard/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
