import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);

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
        <div className="thumbnail-grid-large">
          {client.images.map((img, i) => (
            <motion.div
              key={i}
              className={`thumbnail-wrapper ${selectedImages.includes(img) ? 'selected' : ''}`}
              onClick={() => toggleSelect(img)}
              onDoubleClick={() => setEnlargedImage(img)}
              whileHover={{ scale: 1.02 }}
              layout
            >
              <img
                src={img}
                alt={`Gallery ${i}`}
                className="thumbnail-img-large"
              />
              {selectedImages.includes(img) && (
                <div className="checkmark">✓</div>
              )}
            </motion.div>
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

      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedImage(null)}
          >
            <motion.img
              src={enlargedImage}
              alt="Enlarged"
              className="enlarged-img"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
            />
            <button
              className="back-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
            >
              ⬅ Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientGallery;
