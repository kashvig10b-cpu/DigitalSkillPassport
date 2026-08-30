import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Student Portal Layout & Pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentSkills from './pages/StudentSkills';
import StudentProjects from './pages/StudentProjects';
import StudentCertificates from './pages/StudentCertificates';
import StudentAchievements from './pages/StudentAchievements';
import StudentEducation from './pages/StudentEducation';
import StudentExperience from './pages/StudentExperience';
import StudentResume from './pages/StudentResume';
import StudentQR from './pages/StudentQR';
import StudentCredentials from './pages/StudentCredentials';
import StudentSettings from './pages/StudentSettings';

// Recruiter & Admin Pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicPassport from './pages/PublicPassport';
import RealTimeNotificationToast from './components/RealTimeNotificationToast';

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Lighting Spheres */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 ring-1 ring-white/20">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white block">
                Digital Skill Passport
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Verified Registry
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to={
                  user.role === 'student'
                    ? '/student/dashboard'
                    : user.role === 'recruiter'
                    ? '/recruiter/dashboard'
                    : '/admin/dashboard'
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Dashboard ({user.name})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm hover:border-slate-600"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-center items-center text-center space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="space-y-5 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Cryptographically Verified Skills & Credentials</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Your Verified <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              Digital Skill Passport
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            A real-time credential authority connecting university students with global recruiters. Verified certificates, live skill radar analytics, and instant phone QR code authentication.
          </p>

          {/* Quick Feature Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
              Real-Time Socket.IO Sync
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Phone Camera QR Scanner
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400"></span>
              Direct Recruiter Outreach
            </span>
          </div>
        </div>

        {/* Primary Action Choice (Register & Login) */}
        {user ? (
          <div className="p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 max-w-md w-full text-center space-y-5 shadow-2xl shadow-indigo-950/40">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-md">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Welcome back, {user.name}</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Signed in as <span className="text-indigo-400 font-semibold uppercase">{user.role}</span> • {user.email}
              </p>
            </div>
            <Link
              to={
                user.role === 'student'
                  ? '/student/dashboard'
                  : user.role === 'recruiter'
                  ? '/recruiter/dashboard'
                  : '/admin/dashboard'
              }
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl text-left">
            {/* Login Card */}
            <div className="p-8 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 shadow-2xl flex flex-col justify-between space-y-6 transition-all duration-300 group hover:-translate-y-1">
              <div className="space-y-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors shadow-inner">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                    Sign In
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                    Already have an account? Sign in to access your student passport, upload certificates, or recruit candidates.
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer group-hover:border-indigo-500/30 shadow-md"
              >
                <span>Login to Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Register Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-900/90 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-500/60 shadow-2xl shadow-indigo-950/40 flex flex-col justify-between space-y-6 transition-all duration-300 group hover:-translate-y-1">
              <div className="space-y-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                    Create Account
                  </h2>
                  <p className="text-xs text-indigo-200/80 leading-relaxed mt-1.5">
                    New to Digital Skill Passport? Register in seconds as a student or recruiter to generate your permanent skill passport.
                  </p>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500">
          <span>Digital Skill Passport • Real-Time Credential & Skill Verification System</span>
          <span className="font-mono text-[11px] text-slate-600">Built with React, Node.js & MongoDB</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/passport/:passportId" element={<PublicPassport />} />

        {/* Protected Student Portal with Nested Layout & Sidebar */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="skills" element={<StudentSkills />} />
          <Route path="projects" element={<StudentProjects />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="achievements" element={<StudentAchievements />} />
          <Route path="education" element={<StudentEducation />} />
          <Route path="experience" element={<StudentExperience />} />
          <Route path="credentials" element={<StudentCredentials />} />
          <Route path="qr" element={<StudentQR />} />
          <Route path="resume" element={<StudentResume />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Protected Recruiter Routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <RealTimeNotificationToast />
    </AuthProvider>
  );
}
