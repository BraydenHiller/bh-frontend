import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [enlargedGroup, setEnlargedGroup] = useState([]);

  useEffect(() => {
    fetch(`${API}/clients`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(c => c.id === clientId);
        setClient(found || null);
      });
  }, [clientId]);

  const handleAuthenticate = () => {
    if (passwordInput === client?.password) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const toggleSelect = (src) => {
    setSelectedImages(prev => prev.includes(src)
      ? prev.filter(img => img !== src)
      : [...prev, src]);
  };

  const handleSubmitSelections = () => {
    fetch(`${API}/selections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clientId, selected: selectedImages }),
    }).then(() => alert('Selections submitted!'));
  };

  const handleKeyDown = useCallback((e) => {
    if (!enlargedImage || !enlargedGroup.length) return;
    if (e.key === 'ArrowLeft') {
      const newIndex = (enlargedIndex - 1 + enlargedGroup.length) % enlargedGroup.length;
      setEnlargedIndex(newIndex);
      setEnlargedImage(enlargedGroup[newIndex]);
    }
    if (e.key === 'ArrowRight') {
      const newIndex = (enlargedIndex + 1) % enlargedGroup.length;
      setEnlargedIndex(newIndex);
      setEnlargedImage(enlargedGroup[newIndex]);
    }
  }, [enlargedImage, enlargedGroup, enlargedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!client) return <p>Loading client data...</p>;
  if (!authenticated) {
    return (
      <div className="auth-container">
        <h2>Enter Password for {client.name}'s Gallery</h2>
        <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
        <button onClick={handleAuthenticate}>Enter</button>
      </div>
    );
  }

  return (
    <motion.div className="client-gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>{client.name}'s Gallery</h1>
      <button className="submit-btn" onClick={handleSubmitSelections}>Submit Selections ({selectedImages.length})</button>

      <div className="thumbnail-grid">
        {client.images?.map((src, idx) => (
          <div
            key={idx}
            className="thumbnail-wrapper"
            onClick={() => toggleSelect(src)}
            onDoubleClick={() => {
              setEnlargedGroup(client.images);
              setEnlargedIndex(idx);
              setEnlargedImage(src);
            }}
          >
            <img
              src={src}
              alt={`Gallery ${idx}`}
              className="thumbnail"
              style={{
                border: selectedImages.includes(src) ? '3px solid gold' : '1px solid #666',
                boxShadow: selectedImages.includes(src) ? '0 0 8px gold' : 'none'
              }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {enlargedImage && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.img
              src={enlargedImage}
              alt="Enlarged"
              className="enlarged-img"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
            />
            <div className="nav-buttons">
              <button onClick={() => setEnlargedImage(enlargedGroup[(enlargedIndex - 1 + enlargedGroup.length) % enlargedGroup.length])}>◀</button>
              <button onClick={() => toggleSelect(enlargedImage)}>
                {selectedImages.includes(enlargedImage) ? 'Unselect' : 'Select'}
              </button>
              <button onClick={() => setEnlargedImage(null)}>⬅ Back</button>
              <button onClick={() => setEnlargedImage(enlargedGroup[(enlargedIndex + 1) % enlargedGroup.length])}>▶</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientGallery;
