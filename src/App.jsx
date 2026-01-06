import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ExamEngine from './pages/dashboard/ExamEngine';
import ProfilePage from './pages/dashboard/ProfilePage';
import Leaderboard from './pages/dashboard/Leaderboard';
import Login from './pages/auth/Login';
import Onboarding from './pages/auth/Onboarding';
import SeedDatabase from './pages/admin/SeedDatabase';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionManager from './pages/admin/QuestionManager';
import UserManager from './pages/admin/UserManager';
import StudyBricks from './pages/dashboard/StudyBricks';

// Protected Route Component
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            } />
            <Route path="/seed" element={<SeedDatabase />} />

            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/questions" element={<QuestionManager />} />
              <Route path="admin/users" element={<UserManager />} />

              {/* Student/User Routes */}
              <Route path="dashboard/exam-engine" element={<ExamEngine />} />
              <Route path="dashboard/study-bricks" element={<StudyBricks />} />
              <Route path="dashboard/leaderboard" element={<Leaderboard />} />
              <Route path="dashboard/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
