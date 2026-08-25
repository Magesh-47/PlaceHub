import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { FiUser, FiLock } from 'react-icons/fi';

const features = [
  'Browse & apply for job openings',
  'Track your application status',
  'Admin-managed recruitment drives',
];

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(formData.username, formData.password);
      toast.success('Welcome back, ' + user.username + '!');
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please check your username or password.');
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="login-shell">
      {/* ── Brand panel ── */}
      <div className="login-brand">
        <div className="login-brand-logo">SP</div>

        <h1 className="login-brand-title">Student Placement Hub</h1>
        <p className="login-brand-tagline">
          Empowering careers, one placement at a time.
        </p>

        <div style={{ width: '100%', maxWidth: 280 }}>
          {features.map((f) => (
            <div key={f} className="login-brand-feature">
              <div className="login-brand-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="login-form-panel">
        <div className="login-form-inner animate-fade-in">
          {/* Theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button
              onClick={toggleTheme}
              className="icon-btn"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
            </button>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-subtitle">Enter your credentials to access the portal</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="search-bar" style={{ padding: '0 0.875rem' }}>
                <FiUser size={15} style={{ flexShrink: 0 }} />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              </div>
              <div className="search-bar" style={{ padding: '0 0.875rem' }}>
                <FiLock size={15} style={{ flexShrink: 0 }} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '0.8125rem', fontSize: '0.9375rem', justifyContent: 'center' }}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Student Placement Hub · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
