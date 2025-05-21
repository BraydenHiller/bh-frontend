import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import logo from './assets/site-logo.png'; // 🔁 Replace with your actual logo path

const Landing = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState('');
  const navigate = useNavigate();

  const correctPasscode = '3067mort'; // 🔒 Replace with your admin password

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
