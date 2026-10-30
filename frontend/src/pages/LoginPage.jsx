import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (!form.password) { setError('Password is required'); return; }

    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel */}
      <aside className="auth-left-panel">
        <div className="auth-panel-logo">
          <div className="auth-panel-logo-icon">
            <TrendingUp size={22} color="#fff" />
          </div>
          <span className="auth-panel-logo-text">SpendWise</span>
        </div>

        <h2 className="auth-panel-tagline">
          Take control of <span>your money</span>
        </h2>

        <ul className="auth-panel-benefits">
          {[
            'Track income & expenses effortlessly',
            'Beautiful analytics and spending insights',
            'Secure, private, and always available',
          ].map((item) => (
            <li key={item} className="auth-panel-benefit">
              <div className="auth-panel-benefit-dot">
                <Check size={12} color="#fff" />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Right Panel */}
      <main className="auth-right-panel">
        <div className="auth-form-box">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your SpendWise account</p>

          {error && <div className="auth-error-box">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="password-field-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="auth-forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="auth-form-footer">
              Don&apos;t have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
