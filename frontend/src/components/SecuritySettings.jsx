import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const SecuritySettings = ({ setLoading, setErrorMsg, clearMessages }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalLoading(true);
    clearMessages();
    setSuccessMsg('');

    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      setLoading(false);
      setLocalLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Password changed successfully.');
        e.target.reset();
      } else {
        setErrorMsg(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', marginTop: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
        <Lock size={20} color="var(--primary)" />
        <h3 style={{ margin: 0 }}>Security Settings</h3>
      </div>
      
      {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showCurrentPassword ? "text" : "password"} 
              name="currentPassword"
              placeholder="Enter current password" 
              required
              className="form-input" 
              style={{ paddingRight: '40px' }}
            />
            <span 
              onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
              style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showNewPassword ? "text" : "password"} 
              name="newPassword"
              placeholder="Enter new password" 
              required
              className="form-input" 
              style={{ paddingRight: '40px' }}
            />
            <span 
              onClick={() => setShowNewPassword(!showNewPassword)} 
              style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showConfirmNewPassword ? "text" : "password"} 
              name="confirmNewPassword"
              placeholder="Confirm new password" 
              required
              className="form-input" 
              style={{ paddingRight: '40px' }}
            />
            <span 
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} 
              style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '10px' }} 
          disabled={localLoading}
        >
          {localLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;
