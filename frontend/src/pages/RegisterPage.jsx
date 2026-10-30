import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import './LoginPage.css';
import './RegisterPage.css';

const getPasswordStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6) return 'weak';
  if (pw.length < 10) return 'medium';
  return 'strong';
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ submit: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

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
          Start your <span>financial journey</span> today
        </h2>
        <ul className="auth-panel-benefits">
          {[
            'Set up in under 2 minutes',
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
          <h1>Create account</h1>
          <p className="auth-subtitle">Start tracking your finances today</p>

          {errors.submit && <div className="auth-error-box">{errors.submit}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="password-field-wrapper">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.password && (
                <>
                  <div className="pw-strength-bar-wrap">
                    <div className={`pw-strength-bar pw-strength-bar--${strength}`} />
                  </div>
                  <span className={`pw-strength-label pw-strength-label--${strength}`}>
                    {strength === 'weak' && 'Weak password'}
                    {strength === 'medium' && 'Medium — could be stronger'}
                    {strength === 'strong' && 'Strong password'}
                  </span>
                </>
              )}
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="password-field-wrapper">
                <input
                  id="reg-confirm"
                  type={showConfPw ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfPw((v) => !v)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="auth-form-footer">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
