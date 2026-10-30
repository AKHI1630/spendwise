import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, Check, Eye, EyeOff, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/transactionService';
import PageHeader from '../components/PageHeader';
import { formatDate, getErrorMessage } from '../utils/helpers';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await userService.updateProfile({ name: name.trim(), email: email.trim() });
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile information and account security"
      />

      <div className="settings-grid">
        {/* Left Column: Profile & Info */}
        <div className="settings-col">
          {/* Profile Overview Card */}
          <div className="card settings-card">
            <div className="profile-header-info">
              <div className="profile-avatar-large">{initials}</div>
              <div>
                <h3 className="profile-name">{user?.name || 'User'}</h3>
                <p className="profile-email">{user?.email || ''}</p>
                <div className="profile-joined">
                  <Calendar size={13} />
                  <span>Joined {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="settings-form">
              <h4 className="form-section-title">Personal Details</h4>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="fullName"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emailAddress">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="emailAddress"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? <div className="spinner" /> : <><Check size={16} /> Save Profile Changes</>}
                </button>
              </div>
            </form>
          </div>

          {/* Account Security / Danger Zone */}
          <div className="card settings-card danger-zone-card">
            <h4 className="danger-zone-title">Session Management</h4>
            <p className="danger-zone-desc">
              Log out of your current session on this device. You will need to re-authenticate to access your account.
            </p>
            <button type="button" onClick={handleLogout} className="btn btn-danger">
              <LogOut size={16} /> Log Out from SpendWise
            </button>
          </div>
        </div>

        {/* Right Column: Security / Password */}
        <div className="settings-col">
          <div className="card settings-card">
            <div className="security-card-header">
              <div className="security-icon-badge">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="settings-card-title">Security & Password</h3>
                <p className="settings-card-subtitle">Ensure your account uses a strong, unique password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">Current Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-secondary" disabled={passwordLoading}>
                  {passwordLoading ? <div className="spinner" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

