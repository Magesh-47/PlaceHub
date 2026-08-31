import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiArrowRight, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const highlights = ['Browse roles', 'Track status', 'Admin-managed'];

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
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
      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />

      <div className="login-card">
        {/* ── brand ── */}
        <div className="login-brandbar">
          <div className="login-mark" aria-hidden="true">PH</div>
          <div>
            <span className="login-wordmark">PlaceHub</span>
            <span className="login-eyebrow">Placement Portal</span>
          </div>
        </div>

        <h1 className="login-heading">Welcome back</h1>
        <p className="login-sub">Sign in with your portal credentials to continue.</p>

        {error && (
          <div className="login-error" role="alert">
            <FiAlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="username">Username</label>
            <div className="login-input-wrap">
              <FiUser size={15} />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <FiLock size={15} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none', border: 'none', padding: 0, margin: 0,
                  display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0,
                }}
              >
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
            {!submitting && <FiArrowRight className="login-submit-arrow" size={16} />}
          </button>
        </form>

        <div className="login-meta">
          {highlights.map((h) => (
            <span className="login-meta-item" key={h}>
              <span className="login-meta-dot" aria-hidden="true" />
              {h}
            </span>
          ))}
        </div>
      </div>

      <p className="login-legal">PlaceHub · {new Date().getFullYear()}</p>
    </div>
  );
};

export default Login;
