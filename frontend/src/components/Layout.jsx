import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { FiLogOut, FiKey, FiMenu, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { avatarGradientFor } from '../utils/colors';

const PasswordInput = ({ value, onChange, autoFocus, placeholder, required, disabled }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        className="form-control"
        style={{ paddingRight: '2.5rem' }}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
        }}
      >
        {visible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );
};

/* ─── Layout ─────────────────────────────────────────────── */
const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const MOBILE_Q = '(max-width: 768px)';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_Q).matches);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1'
  );

  // keep isMobile in sync; leaving mobile must also close the drawer
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_Q);
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // Escape closes the mobile drawer
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  // one button, two jobs: drawer on mobile, collapse on desktop
  const toggleMenu = useCallback(() => {
    if (isMobile) setSidebarOpen((o) => !o);
    else setCollapsed((c) => !c);
  }, [isMobile]);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      await api.post('/admin/request-password-otp');
      toast.success('OTP sent to studentplacementhub@gmail.com');
      setOtpSent(true);
    } catch (err) {
      toast.error('Failed to send OTP: ' + (err.response?.data?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user.role === 'ADMIN') {
        if (!otpSent) { toast.warning('Please request OTP first'); setLoading(false); return; }
        await api.post('/admin/change-password-otp', { otp: pwData.otp, newPassword: pwData.newPassword });
      } else {
        await api.post('/auth/change-password', { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      }
      toast.success('Password changed successfully');
      setShowPwModal(false);
      setPwData({ currentPassword: '', newPassword: '', otp: '' });
      setOtpSent(false);
    } catch (err) {
      toast.error('Failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const closePwModal = () => {
    setShowPwModal(false);
    setPwData({ currentPassword: '', newPassword: '', otp: '' });
    setOtpSent(false);
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <Sidebar open={sidebarOpen} collapsed={!isMobile && collapsed} onClose={() => setSidebarOpen(false)} />

      {/* ── Main area ── */}
      <div className="main-area">

        {/* Topbar */}
        <header className="topbar">
          <button
            className="icon-btn hamburger-btn"
            onClick={toggleMenu}
            aria-label={isMobile
              ? (sidebarOpen ? 'Close menu' : 'Open menu')
              : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
            aria-expanded={isMobile ? sidebarOpen : !collapsed}
            aria-controls="app-sidebar"
            title={isMobile
              ? (sidebarOpen ? 'Close menu' : 'Open menu')
              : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
          >
            {isMobile && sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {user?.role === 'ADMIN' ? 'Administrator Portal' : 'Student Portal'}
            </span>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginLeft: 'auto' }}>
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div className="topbar-user-avatar" style={{ background: avatarGradientFor(user.username) }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {user.username}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="topbar-divider" />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="icon-btn"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
              </button>

              {/* Change password */}
              <button
                onClick={() => setShowPwModal(true)}
                className="icon-btn"
                title="Change Password"
              >
                <FiKey size={16} />
              </button>

              {/* Logout */}
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                <FiLogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="page-content animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* ── Change Password Modal ── */}
      {showPwModal && (
        <div className="modal-backdrop" onClick={closePwModal}>
          <div className="modal-card animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Change Password</h3>
              <button className="modal-close" onClick={closePwModal}>×</button>
            </div>

            <form onSubmit={handleChangePassword}>
              {user.role === 'ADMIN' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      Admin Email: <span style={{ color: 'var(--primary-color)' }}>studentplacementhub@gmail.com</span>
                    </label>
                    {!otpSent ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleRequestOtp}
                        disabled={loading}
                        style={{ width: '100%', marginTop: '0.375rem' }}
                      >
                        {loading ? 'Sending…' : 'Send OTP to Email'}
                      </button>
                    ) : (
                      <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.375rem', fontWeight: 600 }}>
                        ✓ OTP sent successfully
                      </p>
                    )}
                  </div>
                  {otpSent && (
                    <div className="form-group">
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={pwData.otp}
                        onChange={(e) => setPwData({ ...pwData, otp: e.target.value })}
                        placeholder="6-digit OTP"
                        required
                        autoFocus
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <PasswordInput
                    value={pwData.currentPassword}
                    onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">New Password</label>
                <PasswordInput
                  value={pwData.newPassword}
                  onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                  placeholder="Min 8 characters"
                  required
                  disabled={user.role === 'ADMIN' && !otpSent}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading || (user.role === 'ADMIN' && !otpSent)}
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closePwModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── ProtectedRoute ─────────────────────────────────────── */
export const ProtectedRoute = ({ roles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout />;
};

export default Layout;
