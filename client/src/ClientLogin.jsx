import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch('https://bh-backend-clean.onrender.com');
    const clients = await res.json();
    const match = clients.find(c => c.id === id && c.password === password);
    if (match) {
      navigate(`/gallery/${id}`);
    } else {
      alert('Invalid ID or password');
    }
  };

  return (
    <div className="client-login">
      <h1>Client Login</h1>
      <input placeholder="Client ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Enter Gallery</button>
    </div>
  );
};

export default ClientLogin;
