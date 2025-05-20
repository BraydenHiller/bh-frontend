import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com'; // 🔁 Replace with your actual backend URL

const Photographer = () => {
  const [clients, setClients] = useState([]);
  const [selections, setSelections] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/clients`);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const fetchSelections = async () => {
    try {
      const res = await fetch(`${API}/selections`);
      const data = await res.json();
      setSelections(data);
    } catch (err) {
      console.error('Failed to fetch selections:', err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchSelections();
  }, []);

  const addClient = async () => {
    console.log("Adding client:", newClientName, newClientId, newPassword);
    if (!newClientId || !newClientName || !newPassword) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(`${API}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newClientId,
          name: newClientName,
          password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add client.');
        return;
      }

      setNewClientName('');
      setNewClientId('');
      setNewPassword('');
      fetchClients();
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  const handleUpload = async (e, clientId) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file)); // Simulate uploads

    try {
      await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, images: urls }),
      });
      fetchClients();
    } catch (err) {
      console.error('Error uploading:', err);
    }
  };

  const getClientSelections = (clientId) => {
    const sel = selections.find(s => s.id === clientId);
    return sel ? sel.selected.length : 0;
  };

  return (
    <motion.div className="photographer-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Photographer Dashboard</h1>

      <div className="form-section">
        <h2>Create New Client Gallery</h2>
        <input
          placeholder="Client Name"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
        />
        <input
          placeholder="Client ID"
          value={newClientId}
          onChange={(e) => setNewClientId(e.target.value)}
        />
        <input
          placeholder="Client Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={addClient}>Add Client</button>
      </div>

      <div className="client-list">
        <h2>Existing Clients</h2>
        {clients.map((client) => (
          <div key={client.id} className="client-card">
            <p><strong>{client.name}</strong> (ID: {client.id})</p>
            <p>Password: {client.password}</p>
            <a href={`/gallery/${client.id}`} target="_blank" rel="noreferrer">View Gallery →</a>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e, client.id)}
              style={{ marginTop: '0.75rem' }}
            />

            <div style={{ marginTop: '0.5rem' }}>
              <strong>Selected:</strong> {getClientSelections(client.id)} images
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Photographer;
