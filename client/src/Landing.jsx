import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Make sure your logo styles are here
import logo from './assets/logo.png'; // Update path to your actual logo

const Landing = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState('');
  const navigate = useNavigate();

  const correctPasscode = 'your-secret-pass'; // CHANGE THIS to your real password

  const handleAdminAccess = () => {
    if (passcode === correctPasscode) {
      navigate('/photographer');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="landing-page">
      <h1>BHCaptureCo.</h1>
      <img src={logo} alt="Logo" className="landing-logo" />

      {!showPassword ? (
        <>
          <button onClick={() => navigate('/client-login')}>Client Login</button>
          <button onClick={() => setShowPassword(true)}>Admin Login</button>
        </>
      ) : (
        <div className="admin-login">
          <input
            type="password"
            placeholder="Enter admin password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <button onClick={handleAdminAccess}>Enter</button>
        </div>
      )}
    </div>
  );
};

export default Landing;
