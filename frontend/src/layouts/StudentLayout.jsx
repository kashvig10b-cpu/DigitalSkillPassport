import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Sparkles,
  FolderGit2,
  Award,
  Trophy,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  QrCode,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', path: '/student/profile', icon: User },
  { name: 'Skills', path: '/student/skills', icon: Sparkles },
  { name: 'Projects', path: '/student/projects', icon: FolderGit2 },
  { name: 'Certificates', path: '/student/certificates', icon: Award },
  { name: 'Achievements', path: '/student/achievements', icon: Trophy },
  { name: 'Education', path: '/student/education', icon: GraduationCap },
  { name: 'Experience', path: '/student/experience', icon: Briefcase },
  { name: 'Credentials', path: '/student/credentials', icon: ShieldCheck },
  { name: 'QR Passport', path: '/student/qr', icon: QrCode },
  { name: 'Resume', path: '/student/resume', icon: FileText },
  { name: 'Settings', path: '/student/settings', icon: Settings },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block">
                Skill Passport
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Student Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Quick Chip */}
        {user?.passportId && (
          <div className="px-6 py-3 bg-indigo-950/20 border-b border-indigo-500/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Passport ID</span>
            <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
              {user.passportId}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-white shadow-sm" />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name ? user.name[0].toUpperCase() : 'S'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-emerald-400 font-mono truncate">Student ID Verified</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white hidden sm:inline-block">
                {user?.college || 'Student Portal'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Socket Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.passportId && (
              <a
                href={`/passport/${user.passportId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Public Passport</span>
              </a>
            )}
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
