import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = ({ setCurrentView, onLoginSuccess, setLoading, setErrorMsg, clearMessages }) => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLocalLoading] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const triggerPasswordVisibility = () => {
    setShowLoginPassword(prev => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalLoading(true);
    clearMessages();
    setResetSuccessMsg('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data);
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    clearMessages();
    setResetSuccessMsg('');
    
    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg('If the email exists, an OTP has been sent. Check your inbox.');
        setForgotStep(2);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    clearMessages();
    setResetSuccessMsg('');
    const formData = new FormData(e.target);
    const otp = formData.get('otp');
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      setLocalLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg('Password reset successfully! You can now log in.');
        setIsForgotPassword(false);
        setForgotStep(1);
        setResetEmail('');
      } else {
        setErrorMsg(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div style={{ maxWidth: '420px', margin: '40px auto', animation: 'fadeIn 0.3s ease-out' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px' }}>
          <div style={{ marginBottom: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)' }} onClick={() => { setIsForgotPassword(false); setForgotStep(1); clearMessages(); setResetSuccessMsg(''); }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Login
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2>Reset Password</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {forgotStep === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
            </p>
          </div>

          {resetSuccessMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{resetSuccessMsg}</div>}

          {forgotStep === 1 ? (
            <form onSubmit={handleSendResetOtp}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com" 
                  className="form-input" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {/* Hidden input to absorb aggressive browser email autofill */}
              <input type="email" name="fake_email" style={{ display: 'none' }} autoComplete="username" />
              
              <div className="form-group">
                <label className="form-label">Reset Code (OTP)</label>
                <input type="text" name="otp" required placeholder="6-digit code" className="form-input" maxLength="6" autoComplete="off" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    name="newPassword" 
                    required 
                    placeholder="••••••••" 
                    className="form-input" 
                    style={{ paddingRight: '40px' }}
                    autoComplete="new-password"
                  />
                  <span 
                    onClick={triggerPasswordVisibility} 
                    style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    name="confirmNewPassword" 
                    required 
                    placeholder="••••••••" 
                    className="form-input" 
                    style={{ paddingRight: '40px' }}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Login to access your tutor or guardian profile</p>
        </div>

        {resetSuccessMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{resetSuccessMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" required placeholder="name@example.com" className="form-input" />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <span onClick={() => { setIsForgotPassword(true); clearMessages(); }} style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>Forgot Password?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showLoginPassword ? "text" : "password"} 
                name="password" 
                required 
                placeholder="••••••••" 
                className="form-input" 
                style={{ paddingRight: '40px' }}
              />
              <span 
                onClick={triggerPasswordVisibility} 
                style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account? <span onClick={() => setCurrentView('register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Register</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
