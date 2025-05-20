import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [selected, setSelected] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    fetch(`${API}/clients`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(c => c.id === clientId);
        setClient(found);
      });

    fetch(`${API}/selections`)
      .then(res => res.json())
      .then(data => {
        const match = data.find(s => s.id === clientId);
        if (match) setSelected(match.selected);
      });
  }, [clientId]);

  const toggleSelect = (url) => {
    setSelected(prev =>
      prev.includes(url) ? prev.filter(i => i !== url) : [...prev, url]
    );
  };

  const submitSelections = () => {
    fetch(`${API}/selections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clientId, selected })
    })
      .then(() => alert('Selections saved!'))
      .catch(err => console.error(err));
  };

  const handleKeyDown = useCallback((e) => {
    if (!enlargedImage || !client?.images?.length) return;

    if (e.key === 'ArrowLeft') {
      const newIndex = (enlargedIndex - 1 + client.images.length) % client.images.length;
      setEnlargedIndex(newIndex);
      setEnlargedImage(client.images[newIndex]);
    }

    if (e.key === 'ArrowRight') {
      const newIndex = (enlargedIndex + 1) % client.images.length;
      setEnlargedIndex(newIndex);
      setEnlargedImage(client.images[newIndex]);
    }
  }, [client, enlargedIndex, enlargedImage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!client) return <p>Loading gallery...</p>;

  return (
    <motion.div className="client-gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>{client.name}'s Gallery</h1>

      <p><strong>Selected:</strong> {selected.length}</p>

      <div className="thumbnail-grid">
        {client.images.map((url, idx) => (
          <div
            key={idx}
            className="thumbnail-wrapper"
            onClick={() => toggleSelect(url)}
            onDoubleClick={() => {
              setEnlargedIndex(idx);
              setEnlargedImage(url);
            }}
          >
            <img
              src={url}
              alt={`img-${idx}`}
              className="thumbnail"
              style={{
                border: selected.includes(url) ? '3px solid gold' : '1px solid #444',
                boxShadow: selected.includes(url) ? '0 0 8px gold' : 'none'
              }}
            />
          </div>
        ))}
      </div>

      <button className="submit-btn" onClick={submitSelections}>Submit Selections</button>

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
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
            <div className="nav-buttons">
              <button onClick={(e) => {
                e.stopPropagation();
                const prevIndex = (enlargedIndex - 1 + client.images.length) % client.images.length;
                setEnlargedIndex(prevIndex);
                setEnlargedImage(client.images[prevIndex]);
              }}>◀</button>

              <button onClick={(e) => {
                e.stopPropagation();
                toggleSelect(enlargedImage);
              }}>
                {selected.includes(enlargedImage) ? 'Deselect' : 'Select'}
              </button>

              <button onClick={(e) => {
                e.stopPropagation();
                const nextIndex = (enlargedIndex + 1) % client.images.length;
                setEnlargedIndex(nextIndex);
                setEnlargedImage(client.images[nextIndex]);
              }}>▶</button>

              <button onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}>⬅ Back</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientGallery;
