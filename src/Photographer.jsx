import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com'; // ✅ Replace with your actual backend URL

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
    const uploadedURLs = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'unsigned-upload');
      formData.append('cloud_name', 'dsgeprirb');

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dsgeprirb/image/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        console.log('Cloudinary response:', data);

        if (data.secure_url) {
          uploadedURLs.push(data.secure_url);
        }
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    }

    console.log('Final uploaded URLs:', uploadedURLs);

    if (uploadedURLs.length > 0) {
      try {
        await fetch(`${API}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: clientId, images: uploadedURLs }),
        });

        fetchClients();
      } catch (err) {
        console.error('Failed to send to backend:', err);
      }
    }
  };

  const getClientSelections = (clientId) => {
    const sel = selections.find(s => s.id === clientId);
    return sel ? sel.selected : [];
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
        {clients.map((client) => {
          const selectedImages = getClientSelections(client.id);
          return (
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
                <strong>Selected:</strong> {selectedImages.length} images
              </div>

              {selectedImages.length > 0 && (
                <div className="thumbnail-grid">
                  {selectedImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Selected"
                      className="thumbnail"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', margin: '5px' }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Photographer;
