import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { motion } from 'framer-motion';
import logo from './assets/site-logo.png'; // 🔁 Replace with your actual logo path

const Landing = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState('');
  const navigate = useNavigate();

  const correctPasscode = '3067mort'; // 🔒 Replace with your admin password

  const handleAdminAccess = () => {
    if (passcode === correctPasscode) {
      navigate('/photographer-login');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="landing-page">
      <motion.h1
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
>
  BHCaptureCo.
</motion.h1>

      <img src={logo} alt="Logo" className="landing-logo" />

      {!showPassword ? (
        <motion.div
  className="button-group"
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
>
  <button onClick={() => navigate('/client-login')}>Client Login</button>
  <button onClick={() => setShowPassword(true)}>Admin Login</button>
</motion.div>


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
