import React, { useEffect, useState, useCallback } from 'react';
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
  const [enlargedGroup, setEnlargedGroup] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(0);

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
import React, { useEffect, useState, useCallback } from 'react';
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
  const [enlargedGroup, setEnlargedGroup] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(0);

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
              onDoubleClick={() => {
                setEnlargedImage(img);
                setEnlargedGroup(client.images);
                setEnlargedIndex(i);
              }}
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

      <AnimatePresence>
        {enlargedImage && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.img src={enlargedImage} alt="enlarged" className="enlarged-img" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} />
            <div className="nav-buttons">
              <button onClick={() => {
                const newIndex = (enlargedIndex - 1 + enlargedGroup.length) % enlargedGroup.length;
                setEnlargedIndex(newIndex);
                setEnlargedImage(enlargedGroup[newIndex]);
              }}>◀</button>
              <button onClick={() => toggleSelect(enlargedImage)}>
                {selectedImages.includes(enlargedImage) ? 'Unselect' : 'Select'} This Image
              </button>
              <button onClick={() => setEnlargedImage(null)}>⬅ Back</button>
              <button onClick={() => {
                const newIndex = (enlargedIndex + 1) % enlargedGroup.length;
                setEnlargedIndex(newIndex);
                setEnlargedImage(enlargedGroup[newIndex]);
              }}>▶</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientGallery;