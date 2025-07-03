import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientLogin = () => {
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/clients`);
      const clients = await res.json();
      const client = clients.find(c => c.name === clientId && c.password === password);

      if (client) {
        navigate(`/gallery/${client.id}`);
      } else {
        setError('Invalid ID or Password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Try again later.');
    }
  };

  return (
    <div className="login-page">
      <h1>Client Login</h1>
      <input
        type="text"
        placeholder="Client ID"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default ClientLogin;
