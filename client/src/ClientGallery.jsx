import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState('');

  const fetchClient = async () => {
    try {
      const res = await fetch(`${API}/clients`);
      const data = await res.json();
      const match = data.find(c => c.id === id);
      setClient(match || null);
    } catch (err) {
      console.error('Failed to fetch client:', err);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleLogin = () => {
    if (client && password === client.password) {
      setAuthenticated(true);
    } else {
      setError('Incorrect password');
    }
  };

  const toggleSelect = (image) => {
    setSelectedImages(prev =>
      prev.includes(image)
        ? prev.filter(img => img !== image)
        : [...prev, image]
    );
  };

  const handleSubmit = async () => {
    try {
      await fetch(`${API}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, selected: selectedImages })
      });
      alert('Your selection has been submitted!');
    } catch (err) {
      console.error('Failed to submit selection:', err);
      alert('There was an error. Please try again.');
    }
  };

  if (!client) {
    return <div>Loading client...</div>;
  }

  if (!authenticated) {
    return (
      <div className="login-screen">
        <h2>Enter Password for {client.name}'s Gallery</h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Enter</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="client-gallery">
      <h2>{client.name}'s Gallery</h2>
      <p>Click to select your favorite images.</p>
      <p><strong>{selectedImages.length}</strong> selected</p>

      {client.images && client.images.length > 0 ? (
        <div className="thumbnail-grid">
          {client.images.map((img, i) => (
            <div
              key={i}
              onClick={() => toggleSelect(img)}
              style={{
                border: selectedImages.includes(img) ? '3px solid limegreen' : '1px solid #ccc',
                borderRadius: '6px',
                display: 'inline-block',
                margin: '5px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img
                src={img}
                alt={`Gallery ${i}`}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              {selectedImages.includes(img) && (
                <div style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'limegreen',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No images uploaded yet.</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={selectedImages.length === 0}
        style={{ marginTop: '1rem' }}
      >
        Submit Selections
      </button>
    </div>
  );
};

export default ClientGallery;
