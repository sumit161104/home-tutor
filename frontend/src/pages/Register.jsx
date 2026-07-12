import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { State, City } from 'country-state-city';

const indianStates = State.getStatesOfCountry('IN').map(state => ({
  value: state.isoCode,
  label: state.name
}));


const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-secondary)',
    zIndex: 9999
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'var(--primary)' : 'var(--bg-secondary)',
    color: state.isFocused ? '#ffffff' : 'var(--text-primary)',
    cursor: 'pointer'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary)'
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-primary)'
  })
};

const Register = ({ setCurrentView, onLoginSuccess, setLoading, setErrorMsg, setSuccessMsg, clearMessages }) => {
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState('GUARDIAN');
  const [loading, setLocalLoading] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const cityOptions = selectedState 
    ? City.getCitiesOfState('IN', selectedState.value).map(city => ({ value: city.name, label: city.name }))
    : [];

  const triggerPasswordVisibility = () => {
    setShowRegisterPassword(prev => !prev);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalLoading(true);
    clearMessages();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const phone = e.target.phone.value;
    const role = e.target.role.value;
    const gender = e.target.gender.value;
    const linkedinUrl = e.target.linkedinUrl.value;
    const state = selectedState ? selectedState.label : ''; // Use label for full state name
    const city = selectedCity ? selectedCity.value : '';

    if (!state || !city) {
        setErrorMsg('Please select a state and city.');
        setLoading(false);
        setLocalLoading(false);
        return;
    }

    const payload = { name, email, password, phone, role, gender, linkedinUrl, state, city };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (data.message) {
          setSuccessMsg(data.message);
          setCurrentView('login');
        } else {
          onLoginSuccess(data);
        }
      } else {
        setErrorMsg(data.error || 'Registration failed. Check inputs.');
      }
    } catch (err) {
      setErrorMsg('Failed to register. Please check your network.');
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign up to advertise services or hire tutors</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Join As</label>
            <select 
              name="role" 
              className="form-select" 
              value={registerRole}
              onChange={e => setRegisterRole(e.target.value)}
            >
              <option value="GUARDIAN">Guardian (Looking for Tutor)</option>
              <option value="TUTOR">Tutor (Looking to Teach)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" required placeholder="e.g. Rahul Kumar" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" required placeholder="name@example.com" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showRegisterPassword ? "text" : "password"} 
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
                {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" name="phone" required placeholder="e.g. +91 9988776655" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" required className="form-select">
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn URL (Optional)</label>
            <input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/username" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">State/UT</label>
            <Select
              options={indianStates}
              placeholder="Select State"
              value={selectedState}
              onChange={(selected) => {
                setSelectedState(selected);
                setSelectedCity(null); // Reset city when state changes
              }}
              classNamePrefix="react-select"
              styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed"
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <CreatableSelect
              placeholder="Select City (or type to add)"
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityOptions}
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              classNamePrefix="react-select"
              styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already registered? <span onClick={() => setCurrentView('login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
