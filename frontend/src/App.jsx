import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/Students';
import AdminJobs from './pages/admin/Jobs';
import AdminApplications from './pages/admin/Applications';
import AdminReports from './pages/admin/Reports';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentJobs from './pages/student/Jobs';
import StudentProfile from './pages/student/Profile';
import StudentApplications from './pages/student/Applications';
import { ProtectedRoute } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute roles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/jobs" element={<StudentJobs />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/my-applications" element={<StudentApplications />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
      {/* react-toastify v9 supplies these via ToastContainer.defaultProps, which React 19's
          JSX runtime no longer applies — pass them explicitly or `transition` is undefined
          and the first toast crashes the app. */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover
        transition={Bounce} theme="light" role="alert" draggablePercent={80} draggableDirection="x" />
    </BrowserRouter>
  );
}

export default App;
