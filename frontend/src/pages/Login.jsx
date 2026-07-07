import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ setCurrentView, onLoginSuccess, setLoading, setErrorMsg, clearMessages }) => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLocalLoading] = useState(false);

  const triggerPasswordVisibility = () => {
    setShowLoginPassword(prev => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalLoading(true);
    clearMessages();
    const email = e.target.email.value;
    const password = e.target.password.value;

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

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Login to access your tutor or guardian profile</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" required placeholder="name@example.com" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
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
